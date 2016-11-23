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
    console.log("Getting Org Teams...");
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
    console.log("Finding requested Team Id...");
    //find the requested team by filtering into only the one that matches the passed in name.
    var foundTeam = teams.filter((team) => team.name === shared.teamName);
    //if we found the team, the length is bigger than 0
    if (foundTeam.length) {
      // We found an id
      shared.teamId = foundTeam[0].id;
      console.log("Found Team Id!");
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
    console.log("Getting a list of Team Repositories...");
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
    console.log("Removing Private repositories from list...");
    fullReposList = fullReposList.filter((repo) => !repo.private);
    return Promise.resolve(fullReposList);
  };

  /**
   * Removes excluded repos from the repo list.
   * @param  {[object]} fullReposList [a list of repos]
   * @return {[Promise]}               [an object that contains a list of repos.]
   */
  var removeExcludedRepos = function(fullReposList) {
    console.log("Removing Excluded Repositories from list...");
    return Promise.filter(fullReposList, ((repo) => {
      return (shared.excludedRepos.indexOf(repo.name === -1));
    }));
  };

  /**
   * The prediux-ui repo doesn't have a master branch, and will reject its promise everytime. this function excludes it from the repo list.
   * @param  {[Array]} dirList [a list of dirs]
   * @return {[Promsie]} [a list of dirs without the predix-ui repo]
   */
  var removePredixUI = function(dirList) {
    return Promise.filter(dirList, (repo) => {
      return repo.name !== "predix-ui";
    });
  };

  /**
   * Creates a root directory, using the localPath flag value.
   * @return {[Promise]} [A resolved promise]
   */
  var createRootDirectory = function() {
    console.log("Creating the local Path " + shared.localPath);
    //since we are in the lib folder, find the last occurance of /
    var lastSlash = __dirname.lastIndexOf("/");
    //and add the localPath after that.
    var dir = __dirname.substr(0, lastSlash) + "/" + shared.localPath;
    //this method checks if there is a directory by the passed name, and if it's not there, creates it.
    fs.ensureDir(dir);
    return Promise.resolve();
  };

  /**
   * loops through the repo list and calls the clonerepo method on each one.
   * @param  {[Array]} fullReposList [a list of all the repos]
   * @return {[Promise]} [an array which contains a list of all the cloned repos]
   */
  var cloneAllRepos = function(fullReposList) {
    console.log("Cloning all the repositories... this will take a while.");
    var pb = new shared.ProgressBar(fullReposList.length);
    return Promise.all(fullReposList.map((repo) => cloneRepo(repo).then((repo) => {
      pb.uptickProgressBar(repo);
      return Promise.resolve(repo);
    })));

  };


  /**
   * Clones an individual repo
   * @param  {[Object]} repo [an object that contains the repo info]
   * @return {[Promise]}      [the dir name]
   */
  var cloneRepo = function(repo) {
        //since we are in the lib folder, find the last occurance of /
    var lastSlash = __dirname.lastIndexOf("/"),
        // and build the correct repo path
        dir = __dirname.substr(0, lastSlash) + "/" + shared.localPath + "/" + repo.name,
        //we have to create this instance and promisify it to do this async.
        simpleGitInst =shared.simpleGit(),
        cloner = Promise.promisify(simpleGitInst.clone, {context: simpleGitInst});

    //clones the repo into the supplied directory, and resolves the promise.
    return cloner(repo.git_url, dir)
    .then(() => Promise.resolve(dir));
  };

   var main = function() {
     //our chain of methods - please note that if there's an empty (), and a call to a method without the () at the end,
     // the parameter returned fromt the previous promise is automatically passed into the new function.
     return shared.createGithubInstance()
     .then((n) => getTeams(n))
            .then((n) => parseTeamId(n))
            .then((n) => getRepos(n))
            .then((n) =>  removePrivateRepos(n))
            .then((n) => removeExcludedRepos(n))
            .then((n) => removePredixUI(n))
            .then((n) => {
              return createRootDirectory()
              .then(() => Promise.resolve(n));
            })
            .then((n) => cloneAllRepos(n))
            .then((n) => {
              console.log("Successfully cloned the repositories!");
              return Promise.resolve(n);
            })
            .error(shared.errFunction);
   };

   return {
     main: main
   };
})();

module.exports = {
  main: cloneRepos.main
};
