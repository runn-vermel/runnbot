
var Promise = require('bluebird'),
    shared = require('../lib/shared'),
    fs = Promise.promisifyAll(require('fs-extra')),
    git = require("git-promise"),
    del = require('del');
/**
 * our IIFE function
 */
var redirectGhpFromPredixdev = (function() {

/**
 * This function deletes all the files except the .git folder
 * @param  {[String]} dir [the path to the current repo]
 * @return {[Promise]}     [resolve or reject]
 */
  var deleteFiles = function(dir) {
    console.log("deleting files in " + dir);
     //process.chdir(dir);
    return del([dir + '/**/*', '!' + dir + '/.git', '!' + dir + '/.git/.*', '!' + dir + '/.git/**'],{dot: true,cwd: dir});
  };

  /**
   * checks out the gh-pages, since that's where we want to save our changes
   * @param  {[String]} dir [the path to the current repo]
   * @return {[Promise]}     [resolve or reject]
   */
  var checkoutGhPages = function(dir) {
    console.log("checking out gh-pages");
    return git('checkout gh-pages', {cwd: dir});
  };

/**
 * creates the index.html file
 * @param  {[String]} dir [the path to the current repo]
 * @return {[Promise]}     [resolve or reject]
 */
  var createFile = function(dir) {
    var filePath = dir + '/index.html';
    return fs.ensureFileAsync(filePath);
  };

  /**
   * adds an index.html page with a re-direct to the correct module on the predix-ui.com site.
   * @param  {[String]} dir [the path to the current repo]
   * @return {[Promise]}     [resolve or reject]
   */
  var addRedirect = function(dir) {
    console.log("adding re-direct");
    var lastIndexOf = dir.lastIndexOf('/'),
        dirName = dir.substr(lastIndexOf + 1),
        redirect = '<META http-equiv=refresh content="0;URL=https://www.predix-ui.com/#/module/' + dirName + '">',
        filePath = dir + '/index.html';
    return fs.writeFileAsync(filePath, redirect)
             .then(() => Promise.resolve(dir));
  };

  var changeGithubDescription = function(dirName) {
    console.log("github stuff");
    return shared.createGithubInstance()
    .then(() => {
      console.log("instance created, no change description");
      return shared.github.repos.edit({owner: 'PredixDev', name: dirName, repo: dirName, homepage: 'https://www.predix-ui.com/#/modules/' + dirName, description: 'For a live demo of this predix UI component, visit'}, (e) => {
        if (!e) {
          console.log("promise resovled");
          return Promise.resolve();
        } else {
          console.log("promise rejected");
          return Promise.reject(e);
        }
      });
    });
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

    return checkoutGhPages(dir)
    .then(() => deleteFiles(dir))
    .then(() => createFile(dir))
    .then(() => addRedirect(dir))
    //.then(() => changeGithubDescription(dirName))
    .then(() => {
      // Success, we're done. Hit the callback.
      cb(null,dir);
    });
  };

  return {
    main : main
  };
})();

module.exports = {
  main: redirectGhpFromPredixdev.main
};
