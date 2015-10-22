/**
 * The main app
 */
var App = angular.module('Vocab', [
  'lumx'
]);

App.config(function($locationProvider) {
  $locationProvider
    .html5Mode({ enabled: true, requireBase: false });
});

App.controller('Main', function($scope, $http, $location, $timeout, LxNotificationService, LxProgressService, LxDialogService) {
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

  /**
   * Init app
   */
  $scope.initApp = function() {
    $scope.init();
  };

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
        $scope.notify('Login Successful!');
        $scope.loggedIn = true;
        $scope.user = user;
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
  * Logout
  */
  $scope.logout = function() {
    $scope.init();
    $scope.notify('Logout Successful!');
  };

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
   * Save clip
   */
  $scope.save = function() {
    var clipboard = $scope.clipboard;
    if (!clipboard) {
      LxNotificationService.error('clipboard is empty');
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



  $scope.incagain = function() {
    if ($scope.again.indexOf($scope.num) === -1) {
      $scope.again.push($scope.num);
    }
    $scope.points += 5;
    $scope.next();
  };

  $scope.incgood = function() {
    if ($scope.good.indexOf($scope.num) === -1) {
      $scope.good.push($scope.num);
    }
    $scope.points += 5;
    $scope.next();
  };

  $scope.inchard = function() {
    if ($scope.hard.indexOf($scope.num) === -1) {
      $scope.hard.push($scope.num);
    }
    $scope.points += 5;
    $scope.next();
  };

  $scope.reset = function() {
    $scope.points = 0;
  };


  /**
   * Next value in vocab
   */
  $scope.next = function() {
    $scope.num = Math.round( 10000 * Math.random() );
    console.log ($scope.num);
    var words = g.statementsMatching($rdf.sym($scope.storageURI + '#' + $scope.num), RDFS('label'));
    for (var i=0; i<words.length; i++) {
      if (i===0) {
        $scope.first = words[i].object.value;
      }
      if (i===1) {
        $scope.second = words[i].object.value;
      }
    }
    $scope.translate = "https://translate.google.com/#cs/en/" + encodeURI($scope.second);
  };


  /**
   * Set Initial variables
   */
  $scope.init = function() {

    $scope.initialized = true;
    $scope.loggedIn = false;
    $scope.loginTLSButtonText = "Login";
    $scope.points = 0;
    $scope.again = [];
    $scope.good = [];
    $scope.hard = [];

    // start in memory DB
    g = $rdf.graph();
    f = $rdf.fetcher(g);

    var storageURI = 'https://melvincarvalho.github.io/data/vocab/czech.ttl';
    if ($location.search().storageURI) {
      storageURI = $location.search().storageURI;
    }

    console.log('load from ' + storageURI);
    f.nowOrWhenFetched(storageURI, undefined, function(ok, body) {
      console.log('loaded from ' + storageURI);
      $scope.num = Math.round( 10000 * Math.random() );
      console.log ($scope.num);
      var words = g.statementsMatching($rdf.sym(storageURI + '#' + $scope.num), RDFS('label'));
      for (var i=0; i<words.length; i++) {
        if (i===0) {
          $scope.first = words[i].object.value;
        }
        if (i===1) {
          $scope.second = words[i].object.value;
        }
      }
      $scope.translate = "https://translate.google.com/#cs/en/" + encodeURI($scope.second);
      $scope.storageURI = storageURI;
    });

  };

  $scope.initApp();

});
