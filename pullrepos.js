var dir = require('node-dir'),
    fs = require("fs"),
    path = require("path"),
    simpleGit = require('simple-git'),
    updateRepos = {
      localPath: process.argv[2] || '',
      getDirs: function() {
        //loop through all subdirs
        var dirList = [];

        fs.readdir(__dirname + "/" + this.localPath, function (err, files) {
        if (err) this.errFunction(err);

        dirList = files
          .map(function (file) {
            return __dirname + "/" + this.localPath + "/" +file;
          }.bind(this))
          .filter(function (file) {
            return file.substr(0, 1) !== "." && !fs.statSync(file).isFile();
          }.bind(this)
        );

        this.pullrepos(dirList);
      });
      },
      pullrepos: function(dirList) {
        dirList.forEach(function(repo){
        process.chdir(repo);
        // simpleGit().fetch('origin', 'master');
        // simpleGit().reset('hard');
        this.simpleGit().pull();
      }.bind(this));
      },
      errFunction: function(err) {
        console.log(err);
      },
      main: function(localPath) {
        this.localPath = localPath;
        this.getDirs();
        return null;
      }
};

module.exports = updateRepos.main;
