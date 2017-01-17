
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
   * Use the github API to remote the current gh-pages branch
   * @param  {[String]} dir [the path to the current repo]
   * @return {[Promise]}     [resolve or reject]
   */
  var removeGhpBranch = function(dir, dirName) {
    return shared.github.gitdata.deleteReference({owner: 'PredixDev', repo: dirName, ref: 'heads/gh-pages'})
            .then((res) => {
              if (res.meta.status === "204 No Content") {
                console.log("branch was deleted in " + dirName);
                return Promise.resolve();
              } else {
                Promise.reject('response wasn\'t right from Github when deleting Branch in ' + dirName + ' res is ' + res.status);
              }
            });
  };

  /**
   * we have to delete the local branch, before we can create an orphan branch
   * @param  {[String]} dir [the path to the current repo]
   * @return {[Promise]}     [resolve or reject]
   */
  var deleteLocalGhp = function(dir) {
    console.log("delete local gh-pages branch");
    return git('branch -D gh-pages', {cwd: dir})
    .catch((e) => {
      return Promise.resolve();
    });
  };

  var isDirInList = function(dirName) {
      var reposWithGhp = ["px-spacing-design","px-layout","px-normalize-design","px-alert-label","px-vis-xy-chart","px-calendar-picker","px-simple-bar-chart","px-box-sizing-design","px-flexbox-design","px-vis-polar","px-helpers-design","px-file-upload","px-inbox","px-rangepicker","px-viewport-design","px-card","px-spinner","px-percent-circle","px-modal","px-page","px-app-nav","px-sample-cards","px-demo-helpers","px-meta-lists-design","px-meta-buttons-design","px-defaults-design","px-action-sheet","px-chart","px-input-group-design","px-navbar","px-dropdown","px-data-table","px-starter-kit-design","px-code-design","px-simple-line-chart","px-list-bare-design","px-widget-cards","px-login","px-drawer","px-widths-tools-design","px-deck-selector","px-popover","px-iconography-design","px-table-view","px-list-inline-design","px-clearfix-design","px-actionable-text-icons-design","px-datetime-range-field","px-datetime-picker","px-toggle-design","px-datetime-common","px-vis-radar","px-vis-spark","px-progress-bar","px-box-design","px-button-group-design","px-widths-responsive-design","px-flag-design","px-datetime-range-panel","px-demo-snippet","px-overlay","px-tooltip","px-widths-design","px-simple-horizontal-bar-chart","px-tables-design","px-datetime-field","px-kpi","px-spacing-responsive-design","px-vis-timeseries","px-vis-pie-chart","px-typography-design","px-slider","px-functions-design","px-timeline","px-typeahead","px-context-browser","px-mixins-design","px-polymer-font-awesome","px-simple-win-loss-chart","px-headings-design"];
      if (reposWithGhp.indexOf(dirName) > -1) {
        return Promise.resolve();
      } else {
        throw new Error('noGhp');
      }
  };

  /**
   * create the gh-pages orphan branch
   * @param  {[String]} dir [the path to the current repo]
   * @return {[Promise]}     [resolve or reject]
   */
  var createOrphanBranch = function(dir) {
    console.log("create orphan gh-pages branch");
    return git('checkout --orphan gh-pages', {cwd: dir});
  };

  /**
   * creates the index.html file
   * @param  {[String]} dir [the path to the current repo]
   * @return {[Promise]}     [resolve or reject]
   */
    var createFile = function(dir) {
      console.log("create file");
      var filePath = dir + '/index.html';
      return fs.ensureFileAsync(filePath);
    };

    /**
     * adds an index.html page with a re-direct to the correct module on the predix-ui.com site.
     * @param  {[String]} dir [the path to the current repo]
     * @return {[Promise]}     [resolve or reject]
     */
    var addRedirect = function(dir) {
      var lastIndexOf = dir.lastIndexOf('/'),
          dirName = dir.substr(lastIndexOf + 1),
          redirect = '<META http-equiv=refresh content="0;URL=https://www.predix-ui.com/#/modules/' + dirName + '">',
          filePath = dir + '/index.html';

          console.log("adding re-direct for " + dirName);

      return fs.writeFileAsync(filePath, redirect)
               .then(() => Promise.resolve(dir));
    };

    var gitReset = function(dir) {
      return git('reset', {cwd:dir});
    };
    /**
     * add, commit and push the index.html file
     * @param  {[String]} dir [the path to the current repo]
     * @return {[Promise]}     [resolve or reject]
     */
    var gitAddCommitPush = function(dir, dirName) {
      return git('add index.html', {cwd:dir})
              .then(() => {
                return git('commit -m "adding redirect to predix-ui.com"',{cwd:dir});
              })
              .then(() => {
                return git('push --repo="https://' + shared.username + ':' + shared.password + '@github.com/PredixDev/' + dirName + '"', {cwd:dir, });
              });
    };

    /**
     * we also want to change the description of each repo to point to the correct url on predix-ui.com
     * @param  {[String]} dirName [the name of the current repo]
     * @return {[Promise]}     [resolve or reject]
     */
    var changeGithubDescription = function(dirName) {
      console.log("github stuff");
      return shared.github.repos.edit({owner: 'PredixDev', name: dirName, repo: dirName, homepage: 'https://www.predix-ui.com/#/modules/' + dirName, description: 'For a live demo of this predix UI component, visit'})
      .then((res) => {
          if (res.meta.status === "200 OK") {
            return Promise.resolve();
          } else {
            return Promise.reject('description change failed on ' + dirName + 'with error' + res.status);
          }
      })
      .catch((e) => {
        console.log('description change failed on ' + dirName + 'with error' + e);
        return Promise.resolve();
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

    return shared.createGithubInstance()
    //.then(() => removeGhpBranch(dir, dirName))
    .then(() => isDirInList(dirName))
    .then(() => deleteLocalGhp(dir))
    .then(() => createOrphanBranch(dir))
    .then(() => createFile(dir))
    .then(() => addRedirect(dir))
    .then(() => gitReset(dir))
    .then(() => gitAddCommitPush(dir, dirName))
    .then(() => changeGithubDescription(dirName))
    .then(() => {
      // Success, we're done. Hit the callback.

    })
    .catch((e) => {
      console.dir(e);
      var doesNotExist ="Reference does not exist";
      console.log('message = '+ (e.code === 422));
      if (e.code === 422 || e.message === "noGhp") {
        console.log(doesNotExist + ' but, we\'ll just move on');
        cb(null,dir);
      } else {
        return Promise.reject(e);
      }
    });
  };

  return {
    main : main
  };
})();

module.exports = {
  main: redirectGhpFromPredixdev.main
};
