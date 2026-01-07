/**
 * solid-localstorage - Sync localStorage to/from Solid pods
 *
 * Phase 1: Library with explicit save/restore
 * Phase 2: Module with auto-sync, conflict resolution
 * Phase 3: Shim that transparently intercepts localStorage
 *
 * Usage:
 *   import { SolidLocalStorage } from './solid-localstorage.js';
 *   const sync = new SolidLocalStorage(session);
 *   await sync.save();    // localStorage → pod
 *   await sync.restore(); // pod → localStorage
 */

export class SolidLocalStorage {
  constructor(options = {}) {
    this.session = options.session || null;
    this.podUrl = options.podUrl || null;
    this.basePath = options.basePath || '/private/localStorage';
    // Use just the hostname, not full origin (cleaner URLs)
    this.origin = options.origin || globalThis.location?.hostname || 'unknown';
    this.onConflict = options.onConflict || 'local-wins'; // 'local-wins' | 'remote-wins' | 'manual' | function
    this.filter = options.filter || null; // function(key) => boolean, null = sync all
  }

  /**
   * Set the authenticated session
   */
  setSession(session) {
    this.session = session;
  }

  /**
   * Set the pod URL
   */
  setPodUrl(podUrl) {
    this.podUrl = podUrl;
  }

  /**
   * Get the full URL for this origin's localStorage on the pod
   */
  getStorageUrl() {
    if (!this.podUrl) throw new Error('Pod URL not set');
    const encodedOrigin = encodeURIComponent(this.origin);
    return `${this.podUrl.replace(/\/$/, '')}${this.basePath}/${encodedOrigin}.json`;
  }

  /**
   * Get localStorage as a plain object
   */
  getLocalData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (this.filter && !this.filter(key)) continue;
      data[key] = localStorage.getItem(key);
    }
    return data;
  }

  /**
   * Save localStorage to Solid pod
   * @returns {Promise<{success: boolean, url: string, keys: number}>}
   */
  async save() {
    if (!this.session?.fetch) throw new Error('No authenticated session');

    const url = this.getStorageUrl();
    const data = this.getLocalData();
    const payload = {
      origin: this.origin,
      savedAt: new Date().toISOString(),
      data
    };

    const response = await this.session.fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload, null, 2)
    });

    if (!response.ok) {
      throw new Error(`Failed to save: ${response.status} ${response.statusText}`);
    }

    return {
      success: true,
      url,
      keys: Object.keys(data).length
    };
  }

  /**
   * Restore localStorage from Solid pod
   * @returns {Promise<{success: boolean, keys: number, merged: boolean}>}
   */
  async restore() {
    if (!this.session?.fetch) throw new Error('No authenticated session');

    const url = this.getStorageUrl();
    const response = await this.session.fetch(url);

    if (response.status === 404) {
      return { success: true, keys: 0, merged: false, notFound: true };
    }

    if (!response.ok) {
      throw new Error(`Failed to restore: ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();
    const remoteData = payload.data || payload; // Support both wrapped and raw format

    // Apply data to localStorage
    let keysRestored = 0;
    for (const [key, value] of Object.entries(remoteData)) {
      if (this.filter && !this.filter(key)) continue;

      const localValue = localStorage.getItem(key);

      if (localValue !== null && localValue !== value) {
        // Conflict!
        if (this.onConflict === 'remote-wins') {
          localStorage.setItem(key, value);
          keysRestored++;
        } else if (this.onConflict === 'local-wins') {
          // Keep local, skip
        } else if (typeof this.onConflict === 'function') {
          const resolution = await this.onConflict(key, localValue, value);
          if (resolution === 'remote') {
            localStorage.setItem(key, value);
            keysRestored++;
          }
        }
      } else if (localValue === null) {
        // No conflict, just restore
        localStorage.setItem(key, value);
        keysRestored++;
      }
    }

    return {
      success: true,
      keys: keysRestored,
      merged: true,
      savedAt: payload.savedAt
    };
  }

  /**
   * Check if remote data exists
   * @returns {Promise<{exists: boolean, savedAt: string|null}>}
   */
  async check() {
    if (!this.session?.fetch) throw new Error('No authenticated session');

    const url = this.getStorageUrl();
    const response = await this.session.fetch(url, { method: 'HEAD' });

    return {
      exists: response.ok,
      url
    };
  }

  /**
   * Delete remote data
   * @returns {Promise<{success: boolean}>}
   */
  async delete() {
    if (!this.session?.fetch) throw new Error('No authenticated session');

    const url = this.getStorageUrl();
    const response = await this.session.fetch(url, { method: 'DELETE' });

    return { success: response.ok || response.status === 404 };
  }

  /**
   * Get diff between local and remote
   * @returns {Promise<{localOnly: string[], remoteOnly: string[], different: string[], same: string[]}>}
   */
  async diff() {
    if (!this.session?.fetch) throw new Error('No authenticated session');

    const url = this.getStorageUrl();
    const response = await this.session.fetch(url);

    const localData = this.getLocalData();
    const localKeys = new Set(Object.keys(localData));

    if (!response.ok) {
      return {
        localOnly: [...localKeys],
        remoteOnly: [],
        different: [],
        same: []
      };
    }

    const payload = await response.json();
    const remoteData = payload.data || payload;
    const remoteKeys = new Set(Object.keys(remoteData));

    const localOnly = [];
    const remoteOnly = [];
    const different = [];
    const same = [];

    for (const key of localKeys) {
      if (!remoteKeys.has(key)) {
        localOnly.push(key);
      } else if (localData[key] !== remoteData[key]) {
        different.push(key);
      } else {
        same.push(key);
      }
    }

    for (const key of remoteKeys) {
      if (!localKeys.has(key)) {
        remoteOnly.push(key);
      }
    }

    return { localOnly, remoteOnly, different, same };
  }
}

// Convenience function for quick setup
export function createSolidLocalStorage(session, podUrl, options = {}) {
  return new SolidLocalStorage({ session, podUrl, ...options });
}

export default SolidLocalStorage;
