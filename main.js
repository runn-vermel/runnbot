var pullrepos = require('./pullrepos');
var bump = require('./bump');
var cloneRepos = require('/.cloneAllRepos');
var pullRepos = require('./pullRepos');
// cloneRepos.main('repos');
//pullrepos.main('repos');

//add your code here


//TODO bump and commit
bump.main('repos', 'patch', 'this is a second test');

//TODO push
