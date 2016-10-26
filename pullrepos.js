var dir = require('node-dir'),
    fs = require("fs"),
    path = require("path"),
    simpleGit = require('simple-git');

    var pullRepos = (function(){
      var localPath;

      function getDirs() {
        //loop through all subdirs
        var dirList = [];
        fs.readdir(__dirname + "/" + localPath, function (err, files) {
          if (err) errFunction(err);

          dirList = files
            .map(function (file) {
              return __dirname + "/" + localPath + "/" +file;
            })
            .filter(function (file) {
              return file.substr(0, 1) !== "." && !fs.statSync(file).isFile();
            }
          );

          pullrepos(dirList);
        });
      }

      function pullrepos(dirList) {
        dirList.forEach(function(repo){
          process.chdir(repo);
          // simpleGit().fetch('origin', 'master');
          // simpleGit().reset('hard');
          simpleGit().pull();
        });
      }

      function errFunction(err) {
        console.log(err);
      }

      function main(llocalPath) {
        localPath = llocalPath;
        getDirs();
      }
      return {
        main: main
      };
})();

module.exports = {
  main:pullRepos.main
};
