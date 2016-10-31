var shared = require('./shared');

var createFullRequestedReposList = (function() {
  var loopThroughRequestedRepos = function() {
    debugger
    var requestedRepos = shared.requestedRepos;
    return Promise.all(requestedRepos.map((repo) => changeRepoToFullPath(repo)));
  };

  var changeRepoToFullPath = function(repo) {
    var lastSlash = __dirname.lastIndexOf("/");
    var dir = __dirname.substr(0, lastSlash) + "/" + shared.localPath + "/" + repo;
    console.log('dir is = ' + dir);
    return Promise.resolve(dir);
  };

  var main = function() {
    return loopThroughRequestedRepos()
    .then((dirList) => Promise.resolve(dirList));
  };

  return {
    main: main
  };
})();

module.exports = {
  main: createFullRequestedReposList.main
};
