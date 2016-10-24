var dir = require('node-dir'),
    fs = require("fs"),
    path = require("path"),
    simpleGit = require('simple-git'),
    exports = module.exports = {};

function pullrepos(localPath) {
  localPath = localPath || process.argv[2];
  function getDirs(localPath) {
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

  function pullrepos(repoList) {
    repoList.forEach(function(repo){
      process.chdir(repo);
      // simpleGit().fetch('origin', 'master');
      // simpleGit().reset('hard');
      simpleGit().pull();
    });
  }

  function errFunction(err) {
    console.log(err);
  }

  function main(localPath) {
    getDirs(localPath);
  }
  return {
    main: main
  };
}

exports.main = function(localPath) {
  return pullrepos().main(localPath);
};
