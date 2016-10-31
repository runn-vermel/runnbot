var shared = require('./shared'),
    Promise = require("bluebird"),
    fs = Promise.promisifyAll(require('fs-extra'));

var cloneRepos = (function() {
  var partialReposList = [],
      fullReposList = [],
      teams = [];

    var getTeams = function() {
      return shared.github.orgs.getTeams({
        org: shared.orgName,
        per_page: "100"
      });
    };

    var parseTeamId = function(teams) {
      var teamId = teams.filter((team) => team.name === shared.teamName);
      if (teamId.length) {
        // We found an id
        shared.teamId = teamId[0].id;
        return Promise.resolve(teamId[0].id);
      } else {
        return Promise.reject();
      }
   };

   var getRepos = function(teamId) {
     function pager(res) {
       fullReposList = fullReposList.concat(res);
       if (shared.github.hasNextPage(res)) {
         return shared.github.getNextPage(res)
           .then(pager);
       }
       return fullReposList;
     }

     return shared.github.orgs.getTeamRepos({
       id: teamId,
       per_page: 100
     })
       .then(pager);
   };

   var removePrivateRepos = function(fullReposList) {
     fullReposList = fullReposList.filter((repo) => !repo.private);
     return Promise.resolve(fullReposList);
   };

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
     //.then(() => );
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
     console.log('in clone main');
     return shared.createGithubInstance()
            .then((n) => {
              console.log("getTeams(n)")
              return getTeams(n);
            })
            .then((n) => {
              console.log("parseTeamId(n)")
              return parseTeamId(n);
            })
            .then((n) => {
              console.log("getRepos(n)")
              return getRepos(n);
            })
            .then((n) => {
              console.log("removePrivateRepos(n)")
              return removePrivateRepos(n);
            })
            .then((n) => {
              console.log("removeExcludedRepos(n)")
              return removeExcludedRepos(n);
            })
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
