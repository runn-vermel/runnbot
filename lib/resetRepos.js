var shared = require('./shared');
var Promise = require("bluebird");
var versiony = require('versiony');

  var resetRepos = (function(){
    var resetRepos = function(dirList) {
      return Promise.map(dirList, function(dir) {
        return resetGit(dir);
      },  {concurrency: int=9})
      .then(() =>  Promise.resolve(dirList));
    };

    var resetGit = function(dir) {
      checkBranch()
      .then((isBranchMaster) =>{
        if (isBranchMaster) {
          return shared.simpleGit(dir)
          .fetch('origin', 'master')
          .reset(['--hard','origin/master'], shared.errFunction)
          .clean('f', ['d'], shared.errFunction)
          .then(() => Promise.resolve(dir));
        } else {
          return shared.simpleGit(dir)
          .fetch('origin', 'master')
          .checkout('master', shared.errFunction)
          .reset(['--hard','origin/master'], shared.errFunction)
          .clean('f', ['d'], shared.errFunction)
          .then(() => Promise.resolve(dir));
        }
      });
    };

    var checkBranch = function(dir) {
      var simpleGitInstance = shared.simpleGit(dir),
          checker = Promise.promisify(simpleGitInstance.status, {context:simpleGitInstance});
      checker()
      .then((status) => Promise.resolve(status.current === "master"));
    };

    var main = function(dirList) {
      if (!shared.requestedRepos.length) {
        return shared.getDirs()
        .then(resetRepos)
        .error(shared.errFunction);
      } else {
        return Promise.resolve(dirList);
      }

    };

    return {
      main: main
    };
})();

module.exports = {
  main:resetRepos.main
};
