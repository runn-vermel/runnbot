var GitHubApi = require('github'),
    argv = require('yargs').argv,
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs-extra'));

var shared = {
  doesFileExist: function(file) {
     return fs.access(file, fs.F_OK, function(err) {
       return (!err) ? Promise.resolve(true) : Promise.resolve(false);
     });
  },
  errFunction: function (err, message) {
      try {
        if (!(err instanceof Error)) {
          err = new Error(err);
          throw err;

        } else if (err.quiet) {
          Promise.onPossiblyUnhandledRejection(function(e, promise) {
            console.log(err.msg);
          });
        }
      }
      catch(e) {
        return;
      }

  },
  simpleGit: require('simple-git'),
  teamName: '',
  username: '',
  password: '',
  teamId: '',
  orgName: '',
  localPath: '',
  bump: '',
  message: '',
  developerModule: '',
  github: '',
  createGithubInstance: function() {
    var github = new GitHubApi({
      headers: {
          "user-agent": shared.orgName
      },
      Promise: require('bluebird')
    });

    github.authenticate({
      type: "basic",
      username: shared.username,
      password: shared.password
    });
    shared.github = github;

    return Promise.resolve(github);
  },
  getDirs: function(callback) {
    var lastSlash = __dirname.lastIndexOf("/");
    var initialDir = __dirname.substr(0, lastSlash) + "/" + shared.localPath;
    var readdir = Promise.promisify(fs.readdir);
    return readdir(initialDir).then(function(files) {
      var dirList = files
       .filter(function (file) {
         if (shared.excludedRepos) {
          return (shared.excludedRepos.indexOf(file) > -1) ? false : true;
         } else {
          return true;
         }
       })
       .map(function (dir) {
         return initialDir + "/" +dir;
       })
       .filter(function (dir) {
         return dir.substr(0, 1) !== "." && !fs.statSync(dir).isFile();
       })
       ;
       return Promise.resolve(dirList);
    }).error(shared.errFunction);
 }
};
shared.localPath = (argv.localPath) ? argv.localPath : 'repos';
shared.excludedRepos = (argv.excludedRepos) ? argv.excludedRepos : '';
shared.bump = argv.bump;
shared.message = (argv.message) ? argv.message : (shared.message) ? shared.message : ''; //check if it was passed in as an arguement, and if it was NOT, check if it already has value - might have been set from another user supplied script
shared.username = argv.username;
shared.password = argv.password;
shared.updatedVersion = '';
shared.developerModule = argv.developerModule;
shared.initial = (argv.initial) ? argv.initial : false;
shared.teamName = (argv.teamName) ? argv.teamName : 'Px';
shared.orgName = (argv.orgName)? argv.orgName : 'PredixDev';


module.exports = shared;
