
var Promise = require('bluebird'),
    shared = require('../lib/shared'),
    fs = Promise.promisifyAll(require('fs-extra'));


/**
 * our IIFE function
 */
var addCloudflareReset = (function() {

  var doesScriptFileExist = function(dir) {
    var lastIndexOf = dir.lastIndexOf('/'),
        dirName = dir.substr(lastIndexOf+1);

    console.log("check if script exists inside " + dirName);
    return shared.doesFileExist(dir + '/scripts/', 'ghp.sh');
  };
  var addCloudflareReset = function(dir) {
    var lastIndexOf = dir.lastIndexOf('/'),
        dirName = dir.substr(lastIndexOf+1);

    console.log("adding reset to " + dirName);
    var appendText=`
sleep 120s

curl -X DELETE "https://api.cloudflare.com/client/v4/zones/\$\{cloudflare_zone_identifier\}/purge_cache" -H "X-Auth-Email: martin.wragg@ge.com" -H "X-Auth-Key: \$\{cloudflare\}" -H "Content-Type: application/json" --data '{"purge_everything":true}'`;
    return fs.appendFile(dir + '/scripts/ghp.sh', appendText);
  };

  /**
   * our Main function. calls the checkForTravisFile to check that we have a travis file in the repo.
   * if it does, add the key, if not, move on.
   * @param  {[String]}   dir [a full path to a repo]
   * @param  {Function} cb  [a dummy callback, needed to promisify this module]
   * @return {[Promise]}       [returns a resolved promise.]
   */
  var main = function(dir, cb) {

    return doesScriptFileExist(dir)
    .then((fileExists) => {
      if (fileExists) {
        return addCloudflareReset(dir);
      } else {
        throw new Error('noGhpFile');
      }
    })
    .then(() => {
      console.log("finished. sad!");
      // Success, we're done. Hit the callback.
      cb(null,dir);
    })
    .catch((e) => {
      if (e.message === 'noGhpFile') {
        var lastIndexOf = dir.lastIndexOf('/'),
            dirName = dir.substr(lastIndexOf+1);

        console.log("couldn't find scripts inside " + dirName);
        cb(null,dir);
      } else {
        console.log(e);
      }
    });
  };

  return {
    main : main
  };
})();

module.exports = {
  main: addCloudflareReset.main
};
