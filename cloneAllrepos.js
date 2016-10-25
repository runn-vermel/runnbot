var simpleGit = require('simple-git'),
    GitHubApi = require('github'),
    mkdirp = require('mkdirp');

var cloneRepos = {
    teamName: process.argv[4] || "Px",
    orgName: process.argv[5] || "PredixDev",
    username: process.argv[2],
    password: process.argv[3],
    teamId: '',
    partialReposList: [],
    fullReposList: [],
    teams: [],
    path: '',
    github: new GitHubApi({
      headers: {
          "user-agent": this.orgName
      }
    }),
    authenticate: function() {
      this.github.authenticate({
        type: "basic",
        username: this.username,
        password: this.password
      });
    },
    getTeams: function(){
      this.github.orgs.getTeams({
        org: this.orgName,
        per_page: "100"
      }, function(err, res) {
        if (err) {
          console.log("******getTeams******");
          console.log(err);
        }
        this.parseTeamId(res);
      }.bind(this));
    },
    parseTeamId: function(teams) {
      teams.forEach(function(team) {
       if (team.name === this.teamName) {
         this.teamId = team.id;
         this.getRepos();
       }
      }.bind(this));
   },
   getRepos: function(page) {
     var _this = this;
     page = page || 1;
     this.partialReposList = this.github.orgs.getTeamRepos({
       id: this.teamId,
       per_page: 100,
       page: page
     }, function(err, res) {
       if (err) {
         console.log("******getRepos******");
         console.log(err);
       }

        var nextPage = _this.github.hasNextPage(res);

        if (!nextPage) {
          _this.addToArray(res);
          this.createRepoDirectory();
        } else {
          //find the next page number. the url is ...?page=X&per_page=100
          var stringStart = nextPage.indexOf('?page=') + 6,
            stringEnd = nextPage.indexOf("&"),
            lenOfString = stringEnd - stringStart,
            pageNum  = nextPage.substr(stringStart, lenOfString);

          _this.addToArray(res);
          _this.getRepos(pageNum);
        }
     }.bind(this));
   },
   removePrivateRepos: function() {
     this.fullReposList.forEach(function(repo, index) {
       if (repo.private) {
         this.fullReposList.splice(index, 1);
       }
     }.bind(this));
     this.cloneAllRepos();
   },
   addToArray: function(obj) {
    for (var item in obj) {
      //console.log(obj[item].name);
       this.fullReposList.push(obj[item]);
    }
   },
   createRepoDirectory: function() {
     mkdirp(__dirname + '/repos', function(err) {
      if (err) {
        console.log("******createRepoDirectory******");
        console.log(err);
      }
      this.removePrivateRepos();
    }.bind(this));
   },

   cloneAllRepos: function() {
     console.log(this.fullReposList.length);
     this.fullReposList.forEach(function(repo) {
       simpleGit().clone(repo.git_url, __dirname + this.path + repo.name);
     }.bind(this));
   },
   main: function(localPath) {
     this.path = localPath;
     this.authenticate();
     this.getTeams();
     return null;
   }
};

module.exports = cloneRepos.main;
