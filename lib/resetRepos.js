var shared = require('./shared');
var Promise = require("bluebird");

/**
 * Our IIFE function
 */
  var resetRepos = (function(){

    /**
     * async calls resetGit on each repo in the dirList, with concurrency of 9, to avoid a stack overflow.
     * @param {[Array]} dirList [a list of dirs]
     * @return {[Promise]} [a list of repos that have been reset]
     */
    var resetRepos = function(dirList) {
      return Promise.map(dirList, function(dir) {
        return resetGit(dir);
      },  {concurrency: int=9});
    };

    /**
     * does a git fetch, checks outs the master branch (with a force flag), does a hard reset to origin/master, removes any non-related git files, and
     * returns the dir.
     * @param {[String]} dir [the repo full path]
     */
    var resetGit = function(dir) {
      return shared.simpleGit(dir)
        .fetch('origin', 'master')
        .checkout(['master','-f'])
        .reset(['--hard','origin/master'])
        .clean('f', ['d'])
        .then(() => Promise.resolve(dir));
    };

    /**
     * Our Main function. calls resetRepos with the dirList, and returns a dirList.
     * @param  {[Array]} dirList [a list of dirs]
     * @return {[Promise]}         [a list of full path repos]
     */
    var main = function(dirList) {
        return resetRepos(dirList)
        .then(() =>  Promise.resolve(dirList));
    };

    return {
      main: main
    };
})();

module.exports = {
  main:resetRepos.main
};
