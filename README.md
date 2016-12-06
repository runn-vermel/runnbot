# RunnBot

### What this script does
This bot is intended to cut down on time maintaining and updating a large number of repositories.

It does this by looping through the specified repos (all|requested|excluded), resetting them, running a user supplied script, doing a bump (patch|minor|major) on  the bower/package/HISTORY files, doing a git commit and tag, and pushing the commits and tags back up to github.


### User Supplied Module

  1. This module should accept the repo's location on the drive as a string (for example, "/users/joe/repos/somerepo") as its only parameter.
  2. This module should be built as either a standard node module, or a promise. this means it should either have a callback (which should NOT actually call anything back), or return a promise. The supplied module is promisified in the background, which is why this structure is required. There are 2 demo modules included in the modules folder.
  3. You should expect the code in this module to be looped through the specified repos.

### How to use this
1. Clone this repo.
2. Write your own module. Please read the "User Supplied Module" section to ensure your module works with Runnbot. Save your module into the modules folder.

3. Go into the lib folder and run this in your terminal. this is the minimum required:

  ```
  node main.js --username="GITHUB_USERNAME" --password="GITHUB_PASSWORD" --bump="patch|minor|major" --message="your commit and history message" --developerModule="myModule"
  ```
  If this is the first time you're running this script, using the flag --initialRunn="true" -runnbot will grab all the repos in the specified team/org (the team/org defaults to "Px/PredixDev"), and clone them into your specified path (using the --localPath flag - default is 'repos').
3. Sit back and enjoy an IPA/Gluten Free Beer.

### Please Note

1. **Do NOT use runnbot on your every day working directories.**
 Part of the process is to reset the repos before your module is run - which means you WILL lose any saved work in any of the repos.
2. **This is a dangerous tool.** use it wisely. To ensure no accidents happen, the tool runs in dryrunn mode by default - you have to specify --dryrunn="false" for it to push the changes live.

## Flags
#### Required
* **--bump** (*String*) Default: ''
  Represents the type of [http://semver.org/](semver) bump you'd like - available options are patch, minor and major.
  Example:
  ```
  --bump="minor"
  ```

* **--message** (*String*) Default: ''

  The message you'd like to include in the History file, and the commit message. Make this as descriptive as possible.
  Example:
  ```
  --message="A good message describes what was done in the commit."
  ```

* **--username** (*String*) Default: ''
  Your Github username. Required for push access and initial cloning.
  Example:
  ```
  --username="linus"
  ```

* **--password** (*String*) Default: ''
  Your Github password. Required for push access and initial cloning.
  Example:
  ```
  --password="aPkBbkiub#5fg"
  ```

* **--developerModule** (*String*) Deafult: ''
  The name of your module, which should be placed in the modules folder. Do not include the .js extension.
  Example:
  ```
  --developerModule="myModule"
  ```

#### Optional

* **--componentReposOnly** (*boolean*) Default: false
  A boolean that represents whether you want to only make the change on components, excluding design repos, and random non-component repos.

* **--designReposOnly** (*Boolean*) Default: false
  A boolean that represents whether the requested change should be done only on design repos.
  Example:
  ```
  --designReposOnly="true"
  ```

* **--dryRunn** (*Boolean*) Default: true
  A boolean indicating whether you'd like the change to stay local (for testing purposes), or go live. On by default to prevent accidental pushes.
  Example:
  ```
  #pushes changes!!
  --dryRunn="false"
  ```

* **--excludePxVis** (*boolean*) Default: false
  A boolean that represents whether you want to exclude px-vis components from your list.

* **--excludedRepos** (*Array*, notated by space) Defult: []
  A list of repos you'd like to exclude. Please note the way the array is built - it is space notated, with no quotes or square brackets. Can not be included in at the same time as the --requestedRepos flag.
  Example:
  ```
  --excludedRepos=px-app-nav px-dropdown
  ```

* **--includeSeed** (*boolean*) Default: false
  A boolean that represents whether you want to include the seed in your list.

* **--includePxVisOnly** (*boolean*) Default: false
  A boolean that represents whether you want to include px-vis components only (components that start with px-vis).

* **--initialRunn** (*Boolean*) Default: false
  A boolean indicating whether this is the first time the script is run. If turned on, this will clone all the repos under the specified team/org (default "Px"/"Predixdev"), in the specified localPath (default "repos"), and run the supplied script on all the repos.
  Example:
  ```
  --initialRunn="true"
  ```

* **--localPath** (String) Default: 'repos'
  This string represents where you'd like the cloned repos to live - please note, this is NOT a full path, just the final directory name - the path will be relative to this repo. This is for your own safety - DO NOT USE YOUR WORK FOLDERS WITH RUNNBOT.
  Example:
  ```
  --localPath="somePath"
  ```
* **--orgName** (*String*) Default: PredixDev
  This Github org name is used during the initial cloning process to determine which repos should be cloned.
  Example:
  ```
  --orgName="SomeOrgName"
  ```

* **--requestedRepos** (*Array*, notated by space) Default: []
  A list of repos you'd like to include. Please note the way the array is built - it is space notated, with no quotes or square brackets. Can not be included in at the same time as the --excludedRepos flag.
  Example:
  ```
  --requestedRepos=px-app-nav px-dropdown
  ```

* **--teamName** (*String*) Default: Px
  This Github team name is used during the initial cloning process to determine which repos should be cloned.
  Example:
  ```
  --teamName="SomeTeamName"
  ```
