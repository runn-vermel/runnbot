
var Promise = require('bluebird'),
    shared = require('../lib/shared'),
    fs = Promise.promisifyAll(require('fs-extra')),
    IsThere = require("is-there");


/**
 * our IIFE function
 */
var changeTextInFile = (function() {

  /**
   * removes the specified text from a file.
   * @param  {[String]} dir [a full path to a repo]
   * @return {[Promise]}     [a resolved promise]
   */
  var changeTextInFile = function(dir) {
    console.log(`Reading ${dir}...`);
    var initialDir = dir;
    var searchText = `npm install vulcanize`,
        regEx = new RegExp(searchText, "g"),
        replaceText = `npm install vulcanize -g`;

    return fs.readFileAsync(dir + "/scripts/ghp.sh", "utf-8")
      .then((fileText) => {
        console.log(`Looking at ${dir} file text...`);

        if (fileText.indexOf(searchText) > -1) {
          console.log(`Found ${dir} file text...`);
          var updatedText = fileText.replace(regEx, replaceText);
          return fs.writeFileAsync(dir + "/scripts/ghp.sh", updatedText, {spaces: 2})
            .then(() => {
              console.log(`Rewrote ${dir} file...`);
              return Promise.resolve(initialDir);
            });
        } else {
          console.log(`No ${dir} file text...`);
          return Promise.resolve(initialDir);
        }
      });
  };

var changeVulcanizedSpelling = function(dir) {
  console.log(`Reading ${dir}...`);
  var initialDir = dir;
  var searchText = `vulacanized`,
      regEx = new RegExp(searchText, "g"),
      replaceText = `vulcanized`;

  return fs.readFileAsync(dir + "/scripts/ghp.sh", "utf-8")
    .then((fileText) => {
      console.log(`Looking at ${dir} file text...`);

      if (fileText.indexOf(searchText) > -1) {
        console.log(`Found ${dir} file text...`);
        var updatedText = fileText.replace(regEx, replaceText);
        return fs.writeFileAsync(dir + "/scripts/ghp.sh", updatedText, {spaces: 2})
          .then(() => {
            console.log(`Rewrote ${dir} file...`);
            return Promise.resolve(initialDir);
          });
      } else {
        console.log(`No ${dir} file text...`);
        return Promise.resolve(initialDir);
      }
    });
};
  /**
   * our Main function. calls the removeTextFromFile function, and once that's done, calls the callback (cb), which doesn't actually do anything
   * but is needed for this module to be promisified.
   * @param  {[String]}   dir [a full path to a repo]
   * @param  {Function} cb  [a dummy callback, needed to promisify this module]
   * @return {[Promise]}       [returns a resolved promise.]
   */
  var main = function(dir, cb) {
    return shared.doesDirExist(dir, 'scripts')
      .then((dirExists) => {
        // If the `.github` directory doesn't exist, we'll skip this task
        if (!dirExists) {
          return Promise.resolve(dir);
        }

        // Otherwise, call the method to change the text
        return changeTextInFile(dir);
      })
      .then((dir) => {
        return shared.doesDirExist(dir, 'scripts')
        .then((dirExists) => {
          if (!dirExists) {
            return Promise.resolve(dir);
          }
          // Otherwise, call the method to change the text
          return changeVulcanizedSpelling(dir);
        });
      })
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
  main: changeTextInFile.main
};
