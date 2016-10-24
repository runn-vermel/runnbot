var pullrepos = require('./pullrepos');
var bump = require('./bump');
//strating point, pull all repos
//pullrepos.main('repos');

//add your code here


//TODO bump and commit
bump.main('repos', 'minor', 'this is a test');

//TODO push
