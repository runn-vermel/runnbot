var fs = require("fs");
var versiony = require('versiony');
var prependFile = require('prepend-file');
var shared = require('./shared');
var Promise = require("bluebird");
var fileExists = require('file-exists');

/**
 * our IIFE function
 *
 */
var bump = (function() {
/**
 *
 * Promise.all collects all the returned promises, and returns them as an array of repos full paths.
 * Loops through all the repo paths, calls a bump and history update on each one.
 *
 * @param  {Array} dirList [An array of all specified repos full paths]
 * @return {[Promise]} [An array of all specified repos full paths]
 */
  function bumpThroughRepos(dirList) {
    return Promise.all(dirList.map(function(dir) {
      return bump(dir);
    }));
  }

  function updateHistoryThroughRepos(dirList) {
    return Promise.all(dirList.map(function(dir) {
      return updateHistory(dir);
    }));
  }

  /**
   * checks for the existance of bower.json and package.json files, and if they exist, bumps the version number by the specified semver bump.
   * if both exist, it will copy the version number from bower.json to package.json to ensure consistancy.
   *
   * @param  {String} dir [Full path to Directory/repo]
   * @return {Promise}     [an object which contains both the updated Version, and the full path of the dir]
   */
  function bump(dir) {
    var bump = (shared.bump === "major") ? "newMajor" : shared.bump,
        updatedVersiony;

    //check if bower exists, and if so, update it.
    if (fileExists(dir + '/bower.json')) {
      updatedVersiony = versiony
        .from(dir + '/bower.json')
        [bump]()
        .to(dir + '/bower.json')
        .end();
      //for some reason, by default, versiony minor only updates the middle number, so, we have to also do a patch(0) on the version.
      if (shared.bump === "minor") {
        updatedVersiony = versiony
        .from(dir + '/bower.json')
        .patch(0)
        .to(dir + '/bower.json')
        .end();
      }
    }
    //check if package exists, if it does, and bower exists as well, copy the version number from bower.json to package.json for consistancy. if it doesn't, do the semver bump as requested.
    if (fileExists(dir + '/package.json')) {
      if (fileExists(dir + '/bower.json')) {
        updatedVersiony = versiony
        .from(dir + '/bower.json')
        .to(dir + '/package.json')
        .end();
      } else {
        updatedVersiony = versiony
        .from(dir + '/package.json')
        [bump]()
        .to(dir + '/package.json')
        .end();
        //for some reason, by default, versiony minor only updates the middle number, so, we have to also do a patch(0) on the version.
        if (shared.bump === "minor") {
          updatedVersiony = versiony
          .from(dir + '/package.json')
          .patch(0)
          .to(dir + '/package.json')
          .end();
        }
      }

    }
    //resolve our promise. both the updated version and directory are needed for the History update portion.
    return Promise.resolve({updatedVersion: updatedVersiony, dir:dir});
  }

  /**
   * Read and insert the update comment at the top of the HISTORY.md file.
   *
   * @param  {[Object]} obj [an object containing the updateVersion and dir]
   * @return {[Promise]}     [an object containing the updateVersion and dir]
   */
  function updateHistory(obj) {
    var dir = obj.dir;
    var updatedVersion = obj.updatedVersion;
    //check to make sure the file exists, or the promise might fail.
    if (fileExists(dir + '/HISTORY.md')) {
      //create our commit message
      var PrependMessage = `v${updatedVersion.version}
==================
* ${shared.message}

`;
      //we have to promisify the prepend file library, to ensure async
      var prependFileAsync = Promise.promisify(prependFile);
      //prepend our commit message to the top, and return our promise.
      if (fileExists(dir + '/HISTORY.md')) {
        return prependFileAsync(dir + '/HISTORY.md', PrependMessage).then(function() {
          return Promise.resolve({dir:dir, version:updatedVersion.version});
        });
      }
    }else {
      return Promise.resolve({dir:dir, version:updatedVersion.version});
    }
  }

  /**
   * Our Main function in bump.
   * @param  {[Array]} dirList [An array of all specified repos full paths]
   * @return {[Array]}         [An array of all specified repos full paths]
   */
  function main(dirList) {
    return bumpThroughRepos(dirList)
    .then((dirList) => {
      return updateHistoryThroughRepos(dirList);
    })
    .then((dirList) => {
      return Promise.resolve(dirList);
    })
    .error(shared.errFunction);
  }

  return {
    main: main
  };
})();

module.exports = {
  main: bump.main
};
