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
          console.log(err);
        }
        this.parseTeamId(res);
      }.bind(this));
    },
    parseTeamId: function(teams) {
     teams.forEach(function(team) {
       console.log(team.name);
       if (team.name === this.teamName) {
         this.teamId = team.id;
         this.getRepos();
       }
     }.bind(this));
   },
   getRepos: function() {
     this.partialReposList = this.github.orgs.getTeamRepos({
       id: this.teamId,
       per_page: 100
     }, function(err, res) {
       if (err) {
         console.log(err);
       }
      this.addToArray(res);

      if (this.github.hasNextPage(res)) {
        this.github.getNextPage(res, this.headers, function(err, res) {
          this.getRepos(res);
        }.bind(this));
      }
       console.log(res);
      this.createRepoDirectory();
     }.bind(this));
   },
   addToArray: function(arr) {
     arr.forEach(function(item) {
       this.fullReposList.push(item);
     }.bind(this));
   },
   createRepoDirectory: function() {
     mkdirp(__dirname + '/repos', function(err) {
      if (err) {
        console.log(err);
      }
      this.cloneAllRepos();
     }.bind(this));
   },

   cloneAllRepos: function() {
     this.fullReposList.forEach(function(repo) {
       simpleGit().clone(repo.git_url, __dirname + '/repos/' + repo.name);
     }.bind(this));
   },
   main: function() {
     this.authenticate();
     this.getTeams();
   }
};

cloneRepos.main();
