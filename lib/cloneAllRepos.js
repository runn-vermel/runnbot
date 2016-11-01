var shared = require('./shared'),
    Promise = require("bluebird"),
    fs = Promise.promisifyAll(require('fs-extra'));

/**
 * Our IIFE function
 */
var cloneRepos = (function() {
  var partialReposList = [],
      fullReposList = [],
      teams = [];

  /**
   * Gets a list of teams from the specified Org Name on Github
   * @return {[Promise]} [a promise which contains an object, that holds all the teams in the specified org.]
   */
  var getTeams = function() {
    return shared.github.orgs.getTeams({
      org: shared.orgName,
      per_page: "100"
    });
  };

  /**
   * Parses the requested team ID from the team obj.
   * @param  {[Object]} teams [an object containing all the teams in the requested Org.]
   * @return {[Promise]}       [returns a promise which holds the requested team id.]
   */
  var parseTeamId = function(teams) {
    //find the requested team by filtering into only the one that matches the passed in name.
    var foundTeam = teams.filter((team) => team.name === shared.teamName);
    //if we found the team, the length is bigger than 0
    if (foundTeam.length) {
      // We found an id
      shared.teamId = foundTeam[0].id;
      return Promise.resolve(foundTeam[0].id);
    } else {
      //didn't find 'nuthing :(
      return Promise.reject();
    }
 };

 /**
  * A recursive function that gets the github repos under the specified team Id, and keeps going back for more, as long as the github headers say there's another page.
  *
  * @param  {[String]} teamId [the previously discovered team id]
  * @return {[Promise]}        [an object that contains a  full repo list.]
  */
  var getRepos = function(teamId) {
    function pager(res) {
      fullReposList = fullReposList.concat(res);
      if (shared.github.hasNextPage(res)) {
        return shared.github.getNextPage(res)
      .then(pager);
      }
      return fullReposList;
  }
  //make the call, and then call your recursive function, to check if there are more pages.
  return shared.github.orgs.getTeamRepos({
   id: teamId,
   per_page: 100
  })
  .then(pager);
  };

  /**
   * remove all repos that are marked as private.
   *
   * @param  {[Obejct]} fullReposList [an object that contains a  full repo list.]
   * @return {[Promise]}               [an object that contains a  full repo list, minus private repos.]
   */
  var removePrivateRepos = function(fullReposList) {
    fullReposList = fullReposList.filter((repo) => !repo.private);
    return Promise.resolve(fullReposList);
  };

  /**
   * Removes excluded repos from the repo list.
   * @param  {[object]} fullReposList [a list of repos]
   * @return {[Promise]}               [an object that contains a list of repos.]
   */
  var removeExcludedRepos = function(fullReposList) {
    return Promise.filter(fullReposList, ((repo) => {
      return (shared.excludedRepos.indexOf(repo.name === -1));
    }));
  };

  var createRootDirectory = function() {
    var lastSlash = __dirname.lastIndexOf("/");
    var dir = __dirname.substr(0, lastSlash) + "/" + shared.localPath;
    fs.ensureDir(dir);
    return Promise.resolve();
  };

  var cloneAllRepos = function(fullReposList) {
    return Promise.all(fullReposList.map((repo) => {
      return cloneRepo(repo);
    }));
  };

   var cloneRepo = function(repo) {
     var lastSlash = __dirname.lastIndexOf("/");
     var dir = __dirname.substr(0, lastSlash) + "/" + shared.localPath + "/" + repo.name;

     var simpleGitInst =shared.simpleGit();
     var cloner = Promise.promisify(simpleGitInst.clone, {context: simpleGitInst});

     return cloner(repo.git_url, dir)
     .then(() => Promise.resolve(dir));
   };

   var main = function() {
     return shared.createGithubInstance()
            .then(() => getTeams)
            .then(() => parseTeamId)
            .then(() => getRepos)
            .then(() => removePrivateRepos)
            .then(() => removeExcludedRepos)
            .then((fullReposList) => {
              return createRootDirectory()
              .then(() => Promise.resolve(fullReposList));
            })
            .then(cloneAllRepos)
            .error(shared.errFunction);
   };

   return {
     main: main
   };
})();

module.exports = {
  main: cloneRepos.main
};
