# Open Sessions [![Build Status](https://travis-ci.org/openactive/open-sessions.svg?branch=master)](https://travis-ci.org/openactive/open-sessions) [![Coverage Status](https://coveralls.io/repos/github/openactive/open-sessions/badge.svg?branch=master)](https://coveralls.io/github/openactive/open-sessions?branch=master)

## Quick-start 

### Setup
To start the project, download and use `npm install` in the root folder to install the dependencies.
### Configure Stormpath
Add a `stormpath.yml` with credentials as described (https://stormpath.com/blog/fullstack-express-angular-stormpath) to allow stormpath integration. (TODO: abstract Stormpath integration away to be non-breaking)
### Running
Run the server with `npm start`. After a few seconds, the server should be up and running and give you the access URLs for your app.