
var Promise = require('bluebird'),
    shared = require('../lib/shared'),
    fs = Promise.promisifyAll(require('fs-extra')),
    IsThere = require("is-there"),
    git = require("git-promise"),
    homeDir = require('home-dir').directory;

/**
 * our IIFE function
 */
var redirectGhp = (function() {

  var getBranches = function(dir) {
    console.log("getting branches for " + dir);
    return git("branch -r", {cwd: dir});
  };

  var cleanBranchList = function(branchList) {
    console.log('cleaning branchList');
    return branchList
      .split("\n")
      .map((b) => {
        return b.replace('origin/HEAD -> origin/master','')
                .replace('origin/','')
                .trim();
      })
    .filter((b) => (b.length));
  };

  var doesGhpExist = function(branchList) {
      if (branchList.indexOf('gh-pages') === -1) {
        throw new Error('noGhp');
      } else {
        return Promise.resolve();
      }
  };

  var copyGitDir = function(dir, dirName) {
      return fs.copyAsync(dir + '/.git', homeDir + '/gitTemp/' + dirName + '/.git');
  };

  var cleanDir = function(dir) {
      return fs.emptyDirAsync(dir);
  };

  var createOrphanBranch = function(dir) {
    return git('checkout --orphan gh-pages', {cwd: dir});
  };

  var createFile = function(dir) {
      return fs.ensureFileAsync(dir + '/index.html');
  };

  var createRedirect = function(dir) {
    var lastIndexOf = dir.lastIndexOf('/'),
        dirName = dir.substr(lastIndexOf+1);
    return fs.writeFileAsync(dir + '/index.html', '<META http-equiv=refresh content="0;URL=https://www.predix-ui.com/#/module/' + dirName + '/' + '">');
  };

  var createTempDir = function(dirName) {
    return fs.ensureDirAsync(homeDir + '/gitTemp/' + dirName);
  };

  var copyGitDirBack = function(dir, dirName) {
      return fs.copyAsync(homeDir + '/gitTemp/' + dirName + "/.git", dir + "/.git");
  };

  var emptyTempDir = function(dirName) {
    console.log('homeDir = ' + homeDir + '/gitTemp/' + dirName);
    return fs.emptyDirAsync(homeDir + '/gitTemp/' + dirName);
  };

  var removeTempFolder = function(dirName) {
    console.log("remove " + homeDir + '/gitTemp/' + dirName);
    return fs.removeAsync(homeDir + '/gitTemp/' + dirName);
  };

  var changeGithubDescriptionAndUrl = function(dirName) {
    return shared.createGithubInstance()
    .then(shared.github.repos.edit({owner: 'predixdev', name: dirName, repo: dirName, homepage: 'https://www.predix-ui,com/#/modules/' + dirName, description: 'For a live demo of this predix UI component, visit'}));
  };

  /**
   * our Main function. calls the removeMasterBranch function, and once that's done, calls the callback (cb), which doesn't actually do anything
   * but is needed for this module to be promisified.
   * @param  {[String]}   dir [a full path to a repo]
   * @param  {Function} cb  [a dummy callback, needed to promisify this module]
   * @return {[Promise]}       [returns a resolved promise.]
   */
  var main = function(dir, cb) {
    var lastIndexOf = dir.lastIndexOf('/'),
        dirName = dir.substr(lastIndexOf + 1);
    return getBranches(dir)
    .then((branchList) => cleanBranchList(branchList))
    .then((branchList) => doesGhpExist(branchList))
    .then(() => createTempDir(dirName))
    .then(() => createOrphanBranch(dir))
    .then(() => copyGitDir(dir, dirName))
    .then(() => cleanDir(dir))
    .then(() => createFile(dir))
    .then(() => createRedirect(dir))
    .then(() => copyGitDirBack(dir, dirName))
    .then(() => emptyTempDir(dirName))
    .then(() => removeTempFolder(dirName))
    .then(() => changeGithubDescriptionAndUrl(dirName))
    .then(() => {
      // Success, we're done. Hit the callback.
      cb(null,dir);
    })
    .catch((e) => {
      if (e.message === 'noGhp') {
        cb(null,dir);
      } else {
        cb(e);
      }
    });
  };

  return {
    main : main
  };
})();

module.exports = {
  main: redirectGhp.main
};
