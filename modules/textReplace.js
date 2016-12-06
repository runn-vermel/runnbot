
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
  var removeTextFromFile = function(dir) {
    var initialDir = dir;
    var searchText = `## Code examples help us better understand the issue - follow the [CodePen](http://codepen.io/mdwragg/pen/LNwmpB) or [jsfiddle](https://jsfiddle.net/Lqmcwhw0/3/), templates, which both use polygit, to help explain the issue.`,
        regEx = new RegExp(searchText, "g"),
        replaceText = `## Code examples help us better understand the issue - follow the appropriate codepen for the component by going to https://predixdev.github.io/predix-ui, finding the component in question, and clicking on the pencil icon under the demo.
        Once you've created your code example, you can save it under a new url.
        Please note that you should NOT use the same methods for production as are used in codepen - these are not production ready.`;


    return fs.readFileAsync(dir + "/.github/ISSUE_TEMPLATE.md", "utf-8")
    .then((fileText) => {
    if (fileText.indexOf(searchText) > -1) {
      var updatedText = fileText.replace(regEx, replaceText);
      fs.writeFileAsync(dir + "/.github/ISSUE_TEMPLATE.md", updatedText, {spaces: 2})
      .then(() => Promise.resolve(initialDir));
    } else {
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

    IsThere(dir + "/.github", function(res) {
      if  (!res) {
        return Promise.resolve(dir);
      }

    removeTextFromFile(dir)
      .then((r) => {
        cb(null,'this is what returns');
      });

    });


  };
  return {
    main : main
  };
})();

module.exports = {
  main: changeTextInFile.main
};
