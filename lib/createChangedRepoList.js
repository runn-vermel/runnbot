var shared = require('./shared'),
    Promise = require('bluebird');
var createChangedRepoList = (function() {
  var createChangedRepoList = function(dirlist) {
    return Promise.all(dirlist.map(function(dir) {
      return checkDir(dir);
    }));
  };

  var removeNullFromList = function(dirList) {
      return dirList.filter((dir) => dir !== null);
  };

  var checkDir = function(dir) {
    var simpleGitInstance = shared.simpleGit(dir),
        checker = Promise.promisify(simpleGitInstance.status, {context:simpleGitInstance});
    return checker()
    .then((status) => {
      console.log(status);
      debugger;
      if (status.modified.length) {
        return Promise.resolve(dir);
      } else {
        return Promise.resolve(null);
      }
    });
  };

  var main = function(dirList) {
      return createChangedRepoList(dirList)
      .then(removeNullFromList);
  };

  return {
     main: main
  };
})();

module.exports = {
  main: createChangedRepoList.main
};
