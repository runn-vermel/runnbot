var simpleGit = require('simple-git'),
    GitHubApi = require('github'),
    mkdirp = require('mkdirp');

var cloneRepos = (function() {
  var teamName = process.argv[4] || "Px",
      orgName = process.argv[5] || "PredixDev",
      username = process.argv[2],
      password = process.argv[3],
      teamId = '',
      partialReposList = [],
      fullReposList = [],
      teams = [],
      path = '',
      github;

    function authenticate() {
      github.authenticate({
        type: "basic",
        username: username,
        password: password
      });
    }

    function getTeams() {
      github.orgs.getTeams({
        org: orgName,
        per_page: "100"
      }, function(err, res) {
        if (err) {
          console.log("******getTeams******");
          console.log(err);
        }
        parseTeamId(res);
      });
    }

    function parseTeamId(teams) {
      teams.forEach(function(team) {
        if (team.name === teamName) {
         teamId = team.id;
         getRepos();
        }
      });
   }

   function getRepos(page) {
     page = page || 1;
     partialReposList = github.orgs.getTeamRepos({
       id: teamId,
       per_page: 100,
       page: page
     }, function(err, res) {
       if (err) {
         console.log("******getRepos******");
         console.log(err);
       }

        var nextPage = github.hasNextPage(res);

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
   }

   function removePrivateRepos() {
     fullReposList.forEach(function(repo, index) {
       if (repo.private) {
         fullReposList.splice(index, 1);
       }
     });
     cloneAllRepos();
   }

   function addToArray(obj) {
    for (var item in obj) {
      //console.log(obj[item].name);
      fullReposList.push(obj[item]);
    }
   }

   function createRepoDirectory() {
     mkdirp(__dirname + "/" + path, function(err) {
      if (err) {
        console.log("******createRepoDirectory******");
        console.log(err);
      }
      removePrivateRepos();
    });
   }

   function cloneAllRepos() {
     fullReposList.forEach(function(repo) {
       simpleGit().clone(repo.git_url, __dirname + "/" + path + "/" + repo.name);
     });
   }

   function main(llocalPath, lusername, lpassword, lteam, lorg) {
     path = llocalPath;
     username = lusername;
     password = lpassword;
     teamName = lteam || "Px";
     orgName = lorg || "PredixDev";
     github = new GitHubApi({
       headers: {
           "user-agent": orgName
       }
     });

     authenticate();
     getTeams();
   }
   return {
     main: main
   };
})();

module.exports = {
  main: cloneRepos.main
};
