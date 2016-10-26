var dir = require('node-dir'),
    fs = require("fs"),
    path = require("path"),
    shared = require('./shared');

    var updateRepos = (function(){
      var updateRepos = function(err, dirList) {
        if (err) shared.errFunction(err);
        dirList.forEach(function(repo){

          var index = repo.lastIndexOf("/"),
              repoName = repo.substr(index + 1);

          if (shared.excludedRepos) {
            if (shared.excludedRepos.indexOf(repoName) > -1) return;
          }

          process.chdir(repo);
          shared.simpleGit().fetch('origin', 'master', function(err){if (err) console.log('fetch ' + err + "\n" + repo);})
          .checkout('master', function(err){if (err) console.log('checkout ' + err + "\n" + repo);})
          .reset(['--hard','origin/master'], function(err){if (err)  console.log('reset' + err + "\n" + repo);})
          .clean('f', ['d'], function(err){if (err) console.log('clean ' + err + "\n" + repo);});
          //shared.simpleGit().pull();
        });
      };

      var main = function() {
        shared.getDirs(updateRepos);
      };

      return {
        main: main
      };
})();

module.exports = {
  main:updateRepos.main
};
