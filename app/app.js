// for debug only
var __kb;
var __scope;


/**
 * The main app
 */
var App = angular.module('Vocab', [
  'ngAudio',
  'lumx'
]);

App.config(function($locationProvider) {
  $locationProvider
    .html5Mode({ enabled: true, requireBase: false });
});

App.controller('Main', function($scope, $http, $location, $timeout, ngAudio, LxNotificationService, LxProgressService, LxDialogService) {
  // Namespaces
  var CHAT  = $rdf.Namespace("https://ns.rww.io/chat#");
  var CURR  = $rdf.Namespace("https://w3id.org/cc#");
  var DCT   = $rdf.Namespace("http://purl.org/dc/terms/");
  var FACE  = $rdf.Namespace("https://graph.facebook.com/schema/~/");
  var FOAF  = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
  var LIKE  = $rdf.Namespace("http://ontologi.es/like#");
  var LDP   = $rdf.Namespace("http://www.w3.org/ns/ldp#");
  var MBLOG = $rdf.Namespace("http://www.w3.org/ns/mblog#");
  var OWL   = $rdf.Namespace("http://www.w3.org/2002/07/owl#");
  var PIM   = $rdf.Namespace("http://www.w3.org/ns/pim/space#");
  var RDF   = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
  var RDFS  = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
  var SIOC  = $rdf.Namespace("http://rdfs.org/sioc/ns#");
  var SOLID = $rdf.Namespace("http://www.w3.org/ns/solid/app#");
  var TMP   = $rdf.Namespace("urn:tmp:");

  var f,g;

  // INIT
  /**
   * Init app
   */
  $scope.initApp = function() {
    $scope.init();
  };

  /**
   * Set Initial variables
   */
  $scope.init = function() {

    $scope.firstLang = 'cs';
    $scope.secondLang = 'en';
    $scope.initialized = true;
    $scope.loggedIn = false;
    $scope.loginTLSButtonText = "Login";
    $scope.points = 0;
    $scope.current = 0;
    $scope.percent = 0;
    $scope.max = 2000;

    $scope.initRDF();
    $scope.initQueryString();
    $scope.initLocalStorage();

    __kb = g;
    __scope = $scope;
  };

  /**
   * Get values from localStorage
   */
  $scope.initLocalStorage = function() {
    if (localStorage.getItem('again')) {
      $scope.again = JSON.parse(localStorage.getItem('again'));
    } else {
      $scope.again = [];
    }
    if (localStorage.getItem('good')) {
      $scope.good = JSON.parse(localStorage.getItem('good'));
    } else {
      $scope.good = [];
    }
    if (localStorage.getItem('easy')) {
      $scope.easy = JSON.parse(localStorage.getItem('easy'));
    } else {
      $scope.easy = [];
    }
    if (localStorage.getItem('user')) {
      var user = JSON.parse(localStorage.getItem('user'));
      $scope.loginSuccess(user);
    }
  };

  /**
   * init RDF knowledge base
   */
  $scope.initRDF = function() {
    var PROXY = "https://rww.io/proxy.php?uri={uri}";
    var AUTH_PROXY = "https://rww.io/auth-proxy?uri=";
    var TIMEOUT = 90000;
    $rdf.Fetcher.crossSiteProxyTemplate=PROXY;

    g = $rdf.graph();
    f = $rdf.fetcher(g, TIMEOUT);
  };

  /**
   * init from query string
   */
  $scope.initQueryString = function() {
    if ($location.search().max) {
      $scope.max = $location.search().max;
    }
    $scope.setMax($scope.max);

    $scope.storageURI = 'https://melvincarvalho.github.io/data/vocab/czech.ttl';
    if ($location.search().storageURI) {
      $scope.storageURI = $location.search().storageURI;
    }
    $scope.setStorageURI($scope.storageURI);

  };

  /**
   * setMax set maximum number of words
   * @param  {Number} max number or words
   */
  $scope.setMax = function(max) {
    $scope.max = max;
    $location.search('max', $scope.max);
  };

  /**
   * setStorageURI set the storage URI for words
   * @param  {String} the storage URI for words
   */
  $scope.setStorageURI = function(storageURI) {
    $scope.storageURI = storageURI;
    $location.search('storageURI', $scope.storageURI);
  };


  // AUTH
  /**
  * TLS Login with WebID
  */
  $scope.TLSlogin = function() {
    var AUTHENDPOINT = "https://databox.me/";
    $scope.loginTLSButtonText = 'Logging in...';
    $http({
      method: 'HEAD',
      url: AUTHENDPOINT,
      withCredentials: true
    }).success(function(data, status, headers) {
      var header = 'User';
      var scheme = 'http';
      var user = headers(header);
      if (user && user.length > 0 && user.slice(0,scheme.length) === scheme) {
        $scope.loginSuccess(user);
      } else {
        $scope.notify('WebID-TLS authentication failed.', 'error');
      }
      $scope.loginTLSButtonText = 'Login';
    }).error(function(data, status, headers) {
      $scope.notify('Could not connect to auth server: HTTP '+status);
      $scope.loginTLSButtonText = 'Login';
    });
  };

  /**
  * loginSuccess called after successful login
  * @param  {String} user the logged in user
  */
  $scope.loginSuccess = function(user) {
    $scope.notify('Login Successful!');
    $scope.loggedIn = true;
    $scope.user = user;
    $scope.fetchAll();
    $('#second').hide('tc-black');
    localStorage.setItem('user', JSON.stringify(user));
  };

  /**
  * Logout
  */
  $scope.logout = function() {
    $scope.init();
    $scope.notify('Logout Successful!');
    localStorage.removeItem('user');
  };


  // FETCH
  /**
  * fecthAll fetches everything
  */
  $scope.fetchAll = function() {
    $scope.fetchStorageURI();
    $scope.fetchSeeAlso();
  };

  /**
   * fetchSeeAlso fetches the see also
   */
  $scope.fetchSeeAlso = function() {
    var seeAlso = 'https://melvincarvalho.github.io/vocab/data/seeAlso.ttl';
    if ($location.search().seeAlso) {
      seeAlso = $location.search().seeAlso;
    }
    f.nowOrWhenFetched(seeAlso, undefined, function(ok, body) {
      console.log('seeAlso fetched from : ' + seeAlso);
    });

  };

  /**
   * fetches the word list from the storageURI
   */
  $scope.fetchStorageURI = function() {
    var dict = $scope.firstLang + '-' + $scope.secondLang;
    if (localStorage.getItem(dict)) {
      $scope.uncacheDictionary();
      return;
    }
    f.nowOrWhenFetched($scope.storageURI, undefined, function(ok, body) {
      console.log('vocab list fetched from : ' + $scope.storageURI);
      $scope.notify('words loaded');
      $scope.next();
      if (!localStorage.getItem(dict)) {
        $scope.cacheDictionary();
      }
    });

  };

  /**
   * Save clip
   */
  $scope.save = function() {
    var clipboard = $scope.clipboard;
    if (!clipboard) {
      $scope.notify('clipboard is empty', 'error');
      return;
    }
    console.log(clipboard);

    $http({
        method: 'PUT',
        url: $scope.storageURI,
        withCredentials: true,
        headers: {
            "Content-Type": "text/turtle"
        },
        data: '<#this> <urn:tmp:clipboard> """' + clipboard + '""" .',
    }).
    success(function(data, status, headers) {
      $scope.notify('clipboard saved');
      $location.search('storageURI', $scope.storageURI);
    }).
    error(function(data, status, headers) {
      $scope.notify('could not save clipboard', 'error');
    });

  };

  /**
   * cache the dictionary
   */
  $scope.cacheDictionary = function() {
    var dict = $scope.firstLang + '-' + $scope.secondLang;
    var words = [];
    for (var i=1; i<=10000; i++) {
      words.push($scope.getPair(i));
    }
    localStorage.setItem(dict, JSON.stringify(words));
    console.log('dict ' + dict + ' saved');
  };

  /**
   * uncache the dictionary
   */
  $scope.uncacheDictionary = function() {
    var lit;
    var dict = $scope.firstLang + '-' + $scope.secondLang;
    var words = JSON.parse(localStorage.getItem(dict));
    var statement;
    for (var i=0; i<words.length; i++) {
      //console.log(words[i]);

      lit = $rdf.lit(words[i][$scope.firstLang]);
      lit.lang = $scope.firstLang;
      g.add(
        $rdf.sym($scope.storageURI + '#' + (i + 1)),
        RDFS('label'),
        $rdf.lit(words[i][$scope.firstLang]),
        $rdf.sym($scope.storageURI)
      );

      lit = $rdf.lit(words[i][$scope.secondLang]);
      lit.lang = $scope.secondLang;
      g.add(
        $rdf.sym($scope.storageURI + '#' + (i + 1)),
        RDFS('label'),
        $rdf.lit(lit),
        $rdf.sym($scope.storageURI)
      );


    }
    console.log('vocab list fetched from : ' + $scope.storageURI);
  };

  // HELPER
  /**
  * Notify
  * @param  {String} message the message to display
  * @param  {String} type the type of notification, error or success
  */
  $scope.notify = function(message, type) {
    console.log(message);
    if (type === 'error') {
      LxNotificationService.error(message);
    } else {
      LxNotificationService.success(message);
    }
  };

  /**
   * incagain increment again
   */
  $scope.incagain = function() {
    if ($scope.again.indexOf($scope.num) === -1) {
      $scope.again.push($scope.num);
      localStorage.setItem('again', JSON.stringify($scope.again));
    }
    $scope.points += 1;
    $scope.percent = Math.round((100* $scope.current) / $scope.points);
    $scope.next();
    $scope.render();
  };

  $scope.incgood = function() {
    if ($scope.good.indexOf($scope.num) === -1) {
      $scope.good.push($scope.num);
      localStorage.setItem('good', JSON.stringify($scope.good));
    }
    $scope.points += 1;
    $scope.percent = Math.round((100* $scope.current) / $scope.points);
    $scope.next();
    $scope.render();
  };

  $scope.inceasy = function() {
    if ($scope.easy.indexOf($scope.num) === -1) {
      $scope.easy.push($scope.num);
      localStorage.setItem('easy', JSON.stringify($scope.easy));
      navigator.vibrate(500);
    }
    $scope.points += 1;
    $scope.current += 1;
    $scope.percent = Math.round((100* $scope.current) / $scope.points);
    $scope.next();
    $scope.render();
  };

  $scope.reset = function() {
    var points = $scope.points;
    $scope.current = 0;
    $scope.points = 0;
    $scope.percent = 0;

    // TODO people specific hooks, generalize
    var inbox = g.any($rdf.sym($scope.user), SOLID('inbox'));
    if (inbox) {
      console.log('writing to : ' + inbox);
      $http({
        method: 'PUT',
        url: inbox.value + 'points.ttl',
        withCredentials: true,
        headers: {
          "Content-Type": "text/turtle"
        },
        data: '<> <> ' + (Math.round(points / 5)*5) + ' .',
      }).
      success(function(data, status, headers) {
        $scope.notify('Points saved');
        $location.search('storageURI', $scope.storageURI);
        $scope.render();
      }).
      error(function(data, status, headers) {
        $scope.notify('could not save points', 'error');
      });
    }
  };

  /**
   * Next value in vocab
   */
  $scope.next = function() {
    $scope.num = Math.round( $scope.max * Math.random() );
    var pair = $scope.getPair($scope.num);
    $scope.first = pair[$scope.firstLang];
    $scope.second = pair[$scope.secondLang];
    $scope.translate = "https://translate.google.com/#cs/en/" + encodeURI($scope.first);
  };

  /**
   * gets a pair of words
   * @param  {Number} num the number of the word
   * @return {Object} object with firstLang word, secondLang word
   */
  $scope.getPair = function(num) {
    var ret = {};
    var words = g.statementsMatching($rdf.sym($scope.storageURI + '#' + num), RDFS('label'));
    for (var i=0; i<words.length; i++) {
      if (words[i].object.lang===$scope.firstLang) {
        ret[$scope.firstLang] = words[i].object.value;
      }
      if (words[i].object.lang===$scope.secondLang) {
        ret[$scope.secondLang] = words[i].object.value;
      }
    }
    return ret;

  };

  /**
   * cycle through word lists
   */
  $scope.cycleMax = function() {
    navigator.vibrate(500);
    var cycle = [2000, 3000, 5000, 10000, 1000];
    var ind = cycle.indexOf($scope.max);
    var next = (ind+1)%(cycle.length);
    $scope.setMax(cycle[next]);
    $scope.notify('Using ' + cycle[next] + ' words');
  };

  /**
  * toggle toggles second field
  */
  $scope.toggle = function() {
    $('#second').show('tc-black');
    setTimeout(function() { $('#second').hide('tc-black'); }, 600);
  };


  // RENDER
  /**
   * render screen
   */
  $scope.render = function() {
    var col = Math.round(($scope.percent*200)/100);
    $('.percent').css('color', 'rgb(0,'+col+',0)');
  };

  /**
  * openDialog opens a dialog box
  * @param  {String} elem  The element to display
  */
  $scope.openDialog = function(elem) {
    LxDialogService.open(elem);
    $(document).keyup(function(e) {
      if (e.keyCode===27) {
        LxDialogService.close(elem);
      }
    });
  };


  $scope.initApp();

});
