var shared = require('./shared');

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
      return shared.getDirs();
    }

  };

  return {
    main: main
  };
})();

module.exports = {
  main: getDirList.main
};
