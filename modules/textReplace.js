
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
    console.log(`Reading ${dir}...`)
    var initialDir = dir;
    var searchText = `## Code examples help us better understand the issue - follow the [CodePen](http://codepen.io/mdwragg/pen/LNwmpB) or [jsfiddle](https://jsfiddle.net/Lqmcwhw0/3/), templates, which both use polygit, to help explain the issue.`,
        regEx = new RegExp(searchText, "g"),
        replaceText = `## Code examples help us better understand the issue - follow the appropriate codepen for the component by going to https://predixdev.github.io/predix-ui, finding the component in question, and clicking on the pencil icon under the demo.
        Once you've created your code example, you can save it under a new url.
        Please note that you should NOT use the same methods for production as are used in codepen - these are not production ready.`;


    return fs.readFileAsync(dir + "/.github/ISSUE_TEMPLATE.md", "utf-8")
      .then((fileText) => {
        console.log(`Looking at ${dir} file text...`)
        if (fileText.indexOf(searchText) > -1) {
          console.log(`Found ${dir} file text...`)
          var updatedText = fileText.replace(regEx, replaceText);
          return fs.writeFileAsync(dir + "/.github/ISSUE_TEMPLATE.md", updatedText, {spaces: 2})
            .then(() => {
              console.log(`Rewrote ${dir} file...`)
              return Promise.resolve(initialDir);
            });
        }
        else {
          console.log(`No ${dir} file text...`)
          return Promise.resolve(initialDir);
        }
      });
  };

  /**
   * Checks if the directory '.github/' directory exists under `dir` path
   *
   * @param  {String} dir - Full system path to a directory to check for '.github/' sub-directory
   * @return {Promise} - Resolves with `true` if '.github' exists, otherwise resolves `false` (should never reject)
   */
  var doesGithubDirExist = function(dir) {
    return new Promise((resolve, reject) => {
      IsThere(dir + "/.github", function(dirStatus) {
        resolve(dirStatus);
      });
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
    return doesGithubDirExist(dir)
      .then((dirExists) => {
        // If the `.github` directory doesn't exist, we'll skip this task
        if (!dirExists) {
          return Promise.resolve(dir);
        }

        // Otherwise, call the method to change the text
        return changeTextInFile(dir);
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
