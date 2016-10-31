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
      return shared.simpleGit(dir)
        .fetch('origin', 'master')
        .checkout(['master','-f'], shared.errFunction)
        .reset(['--hard','origin/master'], shared.errFunction)
        .clean('f', ['d'], shared.errFunction)
        .then(() => Promise.resolve(dir));
    };

    var main = function(dirList) {
      console.log(shared.requestedRepos);
      if (!shared.requestedRepos.length) {
        return shared.getDirs()
        .then(resetRepos);
      } else {
        return resetRepos(dirList);
      }

    };

    return {
      main: main
    };
})();

module.exports = {
  main:resetRepos.main
};
