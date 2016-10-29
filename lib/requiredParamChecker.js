var shared = require('./shared'),
    Promise = require("bluebird");

var requireChecker = (function() {
  var checkParams = function() {
    var requiredParams = ['bump', 'username','password', 'developerModule', 'message'];

    return Promise.map(requiredParams,(param) => {
      var message = "You've left out the required **" + param + "** parameter. Please add this to your call.";
      if (!shared[param]) {
        let thrownErr = new Error(message);
        thrownErr.quiet = true;
        return Promise.reject(thrownErr);
      }
      return Promise.resolve();
    });
  };

  var main = function() {
    return checkParams();
  };

  return {
    main : main
  };
})();

module.exports = {
  main: requireChecker.main
};
