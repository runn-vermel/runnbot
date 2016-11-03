var shared = require('./shared'),
    Promise = require("bluebird");

/**
 * Our IIFE Function
 */
var requireChecker = (function() {

  /**
   * checks for required parameters, as well as ensures that parameters that aren't allowed together aren't.. together.
   * @return {[Promise]} [if all required parameters are there, returns a resolved promise, otherwise, rejects the promise. will also reject the promise if excludedRepos and requestedRepos flags are both called]
   */
  var checkParams = function() {
    var requiredParams = ['bump', 'username','password', 'developerModule', 'message'];

    //check that excludedRepos and requestedRepos aren't both requested.
    if (shared.excludedRepos.length && shared.requestedRepos.length) return Promise.reject('You cannot have both excluded repos, as well as requested repos!');

    return Promise.map(requiredParams,(param) => {
      var message = "You've left out the required **" + param + "** parameter. Please add this to your call.";
      return (!shared[param]) ? Promise.reject(message) : Promise.resolve();
    });
  };

  /**
   * Our Main Function. calls checkParams
   * @return {[Promise]} [A resolved Promise]
   */
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
