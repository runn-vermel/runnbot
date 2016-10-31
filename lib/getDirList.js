var shared = require('./shared');
var Promise = require("bluebird");
var getDirList = (function() {
  var loopThroughRequestedRepos = function() {
    var requestedRepos = shared.requestedRepos;
    return Promise.all(requestedRepos.map((repo) => changeRepoToFullPath(repo)));
  };

  var changeRepoToFullPath = function(repo) {
    var lastSlash = __dirname.lastIndexOf("/");
    var dir = __dirname.substr(0, lastSlash) + "/" + shared.localPath + "/" + repo;
    return Promise.resolve(dir);
  };

  var main = function() {
    if (shared.requestedRepos.length) {
      return loopThroughRequestedRepos()
      .then((dirList) => Promise.resolve(dirList));
    } else {
      console.log('none requested');
      return shared.getDirs()
      .then((dirList) => Promise.resolve(dirList));
    }

  };

  return {
    main: main
  };
})();

module.exports = {
  main: getDirList.main
};
