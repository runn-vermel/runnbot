
var Promise = require('bluebird'),
    shared = require('../lib/shared'),
    fs = Promise.promisifyAll(require('fs-extra')),
    IsThere = require("is-there"),
    git = require("git-promise");

/**
 * our IIFE function
 */
var removeMasterBranch = (function() {
  var getBranches = function(dir) {
    console.log("getting branches for " + dir);
    return git("branch -r", {cwd: dir});
  };

  var cleanBranchList = function(branchList, dirName) {
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

  var deleteBranches = function(branchListObj, dirName, dir) {
    console.log("deleting branches for " + dirName);
    return Promise.each(branchListObj.branches, (branch) => {
      if (branch !=='gh-pages') {
        return deleteBranch(branch, dirName, dir);
      } else {
        return Promise.resolve();
      }
    });
  };

var deleteBranch = function(branch, dirName, dir) {
  console.log("delete " + branch + " on " + dirName);
  return git('push origin --delete ' + branch, {cwd: dir}, (stdout, code) => {
    console.log("code in branch " + branch + " in " + dirName + " = " + code);
    console.log("stdout in branch " + branch + " in " + dirName + " = " + stdout);
  })
  .then(function () {
      console.log("rejoice");
      return Promise.resolve();
  }).fail(function (err) {
    // Something went bad
    console.error(err.message);
    return Promise.reject(err);
  });
};

var checkForOneBranch = function(branchList) {
  return (branchList.length >1) ? {branches: branchList, deleteBranches: true} : {branches: branchList, deleteBranches: false};
};

var setDefaultBranch = function(dirName) {
  console.log("setting default branch for " + dirName);
    return shared.createGithubInstance()
    .then(() => shared.github.repos.edit({default_branch: 'gh-pages', owner: 'predix-ui', name: dirName, repo: dirName }));
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
        dirName = dir.substr(lastIndexOf+1);
    if (dirName !=="predix-ui.github.io") {
      return getBranches(dir)
      .then((branchList) => cleanBranchList(branchList, dirName))
      .then((branchList) => checkForOneBranch(branchList))
      .then((branchListObj) => {
        console.log("check is over in "   + dirName);
        if (branchListObj.deleteBranches) {
          console.log("delete branch(es), inside " + dirName);
          return setDefaultBranch(dirName)
          .then(() => {
            console.log("default branch should be changed in " + dirName);
            return deleteBranches(branchListObj, dirName, dir);
          });
        } else {
          console.log("only 1 repo, do not delete anything in "  + dirName);
          return Promise.resolve();
        }
      })
      .then(() => {
        console.log(dirname + "is done");
        // Success, we're done. Hit the callback.
        cb(null,dir);
      });
    } else {
        cb(null,dir);
    }

  };

  return {
    main : main
  };
})();

module.exports = {
  main: removeMasterBranch.main
};
