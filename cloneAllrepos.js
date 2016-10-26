var mkdirp = require('mkdirp'),
    shared = require('./shared');

var cloneRepos = (function() {
  var partialReposList = [],
      fullReposList = [],
      teams = [];

    var getTeams = function() {
      shared.github.orgs.getTeams({
        org: shared.orgName,
        per_page: "100"
      }, function(err, res) {
        if (err) {
          shared.errFunction(err);
        }
        parseTeamId(res);
      });
    };

    var parseTeamId = function(teams) {
      teams.forEach(function(team) {
        if (team.name === shared.teamName) {
         shared.teamId = team.id;
         getRepos();
        }
      });
   };

   var getRepos = function(page) {
     page = page || 1;
     partialReposList = shared.github.orgs.getTeamRepos({
       id: shared.teamId,
       per_page: 100,
       page: page
     }, function(err, res) {
       if (err) {
         shared.errFunction(err);
       }

        var nextPage = shared.github.hasNextPage(res);

        if (!nextPage) {
          addToArray(res);
          createRepoDirectory();
        } else {
          //find the next page number. the url is ...?page=X&per_page=100
          var stringStart = nextPage.indexOf('?page=') + 6,
            stringEnd = nextPage.indexOf("&"),
            lenOfString = stringEnd - stringStart,
            pageNum  = nextPage.substr(stringStart, lenOfString);

          addToArray(res);
          getRepos(pageNum);
        }
     });
   };

   var removePrivateRepos = function() {
     fullReposList.forEach(function(repo, index) {
       if (repo.private) {
         fullReposList.splice(index, 1);
       }
     });

     removeRequestedRepos();
   };

   var removeRequestedRepos = function() {
     var repoNameOnly = fullReposList.map(function(repo) {
       var loc = repo.lastIndexOf("/");
       return repo.substr(loc + 1);
     });
     if (shared.excludedRepos) {
       shared.excludedRepos.forEach(function(repo) {
         var index = repoNameOnly.indexOf(repo);
         if (index > -1) {
           repoNameOnly.splice(index, 1);
           fullReposList.splice(index, 1);
         }
       });
     }
     cloneAllRepos();
   };

   var addToArray = function(obj) {
    for (var item in obj) {
      //console.log(obj[item].name);
      fullReposList.push(obj[item]);
    }
  };

   var createRepoDirectory = function() {
     mkdirp(__dirname + "/" + shared.localPath, function(err) {
      if (err) {
        shared.errFunction(err);
      }
      removePrivateRepos();
    });
  };

   var cloneAllRepos = function() {
     fullReposList.forEach(function(repo) {
       console.log(repo.git_url);
       shared.simpleGit().clone(repo.git_url, __dirname + "/" + shared.localPath + "/" + repo.name);
     });
   };

   var main = function() {
     shared.authenticate();
     getTeams();
   };

   return {
     main: main
   };
})();

module.exports = {
  main: cloneRepos.main
};
