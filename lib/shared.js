var GitHubApi = require('github'),
    argv = require('yargs')
    .array('requestedRepos')
    .array('excludedRepos')
    .options({
      dryRunn: {
        default: true,
        type: 'boolean'
      },
      designReposOnly: {
        default: false,
        type: 'boolean'
      },
      initialRunn: {
        default: false,
        type: 'boolean'
      }
    })
    .argv,
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs-extra'));

/**
 * our main shared object
 * @type {Object}
 */
var shared = {
  //pre-configure  our shared vars
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
  /**
   * this function is called on error
   * @param  {[Error]} err [a description of the err]
   */
  errFunction: function (err) {
    console.log(err);
  },
  /**
   * creates a githubInstance that is promisified, and receives a username and password, as well as specific headers.
   * @return {[Promise]} [returns the Github object instance.]
   */
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
  /**
   * gets a list of directories, compiled from a location created by the localPath flag and current location.
   * @return {[Promise]} [a list of directories/repos, each in full path]
   */
  getDirs: function() {
    var lastSlash = __dirname.lastIndexOf("/"),
        initialDir = __dirname.substr(0, lastSlash) + "/" + shared.localPath,
        readdir = Promise.promisify(fs.readdir);

    return readdir(initialDir)
    .error((e) => Promise.reject("I didn't find a directory with the path " + initialDir + ". If this is the first time you're running Runnbot, be sure to include the --initialRunn=true flag in your call to bring in the approriate repos."))
    .then(function(files) {
      var dirList = files
       .filter((filesOrDir) => {
         if (shared.excludedRepos) {
           //since this is the EXCLUDED list, we DON'T want to return the ones that match the filter.
          return (shared.excludedRepos.indexOf(filesOrDir) > -1) ? false : true;
         } else {
           //if shared.excludedRepos is off, just return true.
          return true;
         }
       })
       //add the full path to the file or dir name
       .map( (fileOrDir) => initialDir + "/" + fileOrDir)
       //removes all the files and folders that start with a .
       .filter((fileOrDir) => fileOrDir.substr(0, 1) !== "." && !fs.statSync(fileOrDir).isFile());
       return Promise.resolve(dirList);
    }).error(shared.errFunction);
 }
};

/**
 * configure all of the shared variables from the yargs.
 */
shared.localPath = (argv.localPath) ? argv.localPath : 'repos';
shared.excludedRepos = (argv.excludedRepos) ? argv.excludedRepos : '';
shared.requestedRepos = (argv.requestedRepos) ? argv.requestedRepos : [];
shared.designReposOnly = argv.designReposOnly;
shared.initialRunn = argv.initialRunn;
shared.teamName = (argv.teamName) ? argv.teamName : 'Px';
shared.orgName = (argv.orgName)? argv.orgName : 'PredixDev';
shared.dryRunn= argv.dryRunn;
//check if it was passed in as an arguement, and if it was NOT, check if it already has value - might have been set from another user supplied script
shared.message = (argv.message) ? argv.message : (shared.message) ? shared.message : '';
shared.bump = argv.bump;
shared.username = argv.username;
shared.password = argv.password;
shared.updatedVersion = '';
shared.developerModule = argv.developerModule;
module.exports = shared;
