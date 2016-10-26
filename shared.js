var GitHubApi = require('github'),
    fs = require("fs"),
    argv = require('yargs').argv;

var shared = {
  doesFileExist: function(path) {
   try {
     return fs.statSync(path).isFile();
    } catch (e) {
      if (e.code === 'ENOENT') {
       return false;
      } else {
       throw e;
      }
    }
  },
  errFunction: function (err) {
    console.log(err);
  },
  simpleGit: require('simple-git'),
  teamName: '',
  username: '',
  password: '',
  teamId: '',
  orgName: '',
  localPath: '',
  github: '',
  authenticate: function() {
    shared.github.authenticate({
      type: "basic",
      username: shared.username,
      password: shared.password
    });
  },
  getDirs: function(callback) {
    var dirList=[];
    fs.readdir(__dirname + "/" + shared.localPath, function (err, files) {
     if (err) callback(err);

     dirList = files
      .filter(function (file) {
        if (shared.excludedRepos) {
         return (shared.excludedRepos.indexOf(file) > -1) ? false : true;
        } else {
         return true;
        }
      })
      .map(function (file) {
        return __dirname + "/" + shared.localPath + "/" +file;
      })
      .filter(function (file) {
        return file.substr(0, 1) !== "." && !fs.statSync(file).isFile();
      })
      ;
     callback(err, dirList);
    });
 }
};
shared.localPath = (argv.localPath) ? argv.localPath : 'repos';
shared.excludedRepos = (argv.excludedRepos) ? argv.excludedRepos : '';
shared.username = argv.username;
shared.password = argv.password;
shared.teamName = (argv.teamName) ?argv.teamName : 'Px';
shared.orgName = (argv.orgName)? argv.orgName : 'PredixDev';
shared.github = new GitHubApi({
  headers: {
      "user-agent": shared.orgName
  }
});

module.exports = shared;
