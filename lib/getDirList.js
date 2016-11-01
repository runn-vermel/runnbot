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

  var removePredixUI = function(dirList) {
    return Promise.filter(dirList, (dir) => {
      var lastSlash = dir.lastIndexOf("/"),
          dirName = dir.substr(lastSlash+1);
      return dirName !== "predix-ui";
    });
  };

  var main = function() {
    if (shared.requestedRepos.length) {
      return loopThroughRequestedRepos()
      .then((dirList) => Promise.resolve(dirList));
    } else {
      return shared.getDirs()
      .then(removePredixUI)
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
