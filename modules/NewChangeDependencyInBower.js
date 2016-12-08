var Promise = require('bluebird'),
    shared = require('../lib/shared'),
    fs = Promise.promisifyAll(require('fs-extra'));

/**
 * our IIFE function
 */
var updateDependency = (function() {

  /**
   * Checks if a bower.json file exists in the directory at `dirPath`. Always
   * returns a Promise that resolves (never rejects). The Promise will resolve
   * `true` if the bower.json file exists, or `false` if it does not.
   *
   * @param  {String} dirPath - Full system path to a directory to check for a bower.json file
   * @return {Promise|Boolean} - Resolves `true` if bower.json exists, `false` if it does not
   */
  var checkIfBowerExists = function(dirPath) {
    return new Promise((resolve, reject) => {
      let bowerPath = `${dirPath}/bower.json`;
      fs.stat(bowerPath, (err, stats) => {
        if (err) resolve(false); // If there's an error, resolve false
        if (stat.isFile()) resolve(true); // If it is a file, resolve true
        resolve(false); // Otherwise, default to resolve false
      })
    });
  };

  /**
   * Checks if the dependency named `depName` is listed in the bower.json file
   * in directory at `dirPath`. If it exists, updates the requested version to
   * be `depNewVersion` and writes the result.
   *
   * To also update devDependencies, pass an object for `opts` with
   * `opts.includeDevDependencies` set to true.
   *
   * Example:
   * changeDependencyIfExists('/path/to/dir', 'px-polymer-font-awesome', '^1.0.0', { includeDevDependencies: true });
   *
   * @param  {String} dirPath - Full system path to the directory to change bower.json file in
   * @param  {String} depName - Name of the dependency to update
   * @param  {String} depNewVersion - New version of the dependency to set
   * @param  {Object} opts - Settings object to configure method. (See description.)
   * @return {Promise} - Always resolves
   */
  var changeDependencyIfExists = function(dirPath, depName, depNewVersion, opts) {
    opts = opts || {};

    // Read the JSON from 'bower.json' intro an object
    return fs.readJsonAsync(dirPath + '/bower.json')
      .then((bowerObj) => {
        // make sure bower has dependencies and a px-slider parameter.
        // if your condition is met, resolve the promise with 2 parameters: bower, and changed.

        let newBowerObj = bowerObj,
            changed = false;

        // First, check if the `dependencies` key has the `depName`
        if (newBowerObj.dependencies && newBowerObj.dependencies.hasOwnProperty(depName)) {
          // If so, attempt to replace it
          newBowerObj.dependencies[depName] = depNewVersion;
          changed = true;
        };

        // If the user set the `opts.includeDevDependencies` to `true`, also search and attempt
        // to change the dependency in `devDependencies`
        if (opts.includeDevDependencies && newBowerObj.devDependencies && newBowerObj.devDependencies.hasOwnProperty(depName)) {
          // If so, attempt to replace it
          newBowerObj.devDependencies[depName] = depNewVersion;
          changed = true;
        };

        // If nothing changed, resolve the promise with `changed:false` to not write to the bower.json file
        if (!changed) {
          return Promise.resolve({bower: newBowerObj, changed: false});
        }

        // Otherwise, resolve the promise with `changed:true` to write the changes
        return Promise.resolve({bower: newBowerObj, changed: true});
      })
      //resolved promise is picked up here
      .then((resultObj) => {
        // If nothing changed, resolve immediately
        if (!resultObj.changed) return Promise.resolve();

        // Otherwise, write the file and return result
        return fs.writeJsonAsync(dir + '/bower.json', resultObj.bower, {spaces: 2});
      });
  };

  /**
   * Our main function. Checks if bower.json file exists in `dir`. If it does,
   * attempts to update dependencies and devDependencies for the modules we
   * want to change versions of.
   *
   * @param  {String} dir - a full path to a repo
   * @param  {Function} cb - callback function needed to promisify this module
   */
  var main = function(dir, cb) {
    checkIfBowerExists(dir)
      .then((bowerExists) => {
        // If there's no bower.json file, callback immediately and stop messing with this directory.
        if (!bowerExists) cb(null);
        // Otherwise, continue on to try to change dependency
        return changeDependencyIfExists(dir, 'px-polymer-font-awesome', '^1.0.0', { includeDevDependencies: true });
      })
      .then(() => {
        // At this point, we should be finished. Callback and finish up.
        cb(null);
      });
  };

  return {
    main : main
  };
})();

module.exports = {
  main: updateDependency.main
};
