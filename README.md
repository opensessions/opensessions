# Open Sessions [![Build Status](https://travis-ci.org/openactive/open-sessions.svg?branch=master)](https://travis-ci.org/openactive/open-sessions) [![Coverage Status](https://coveralls.io/repos/github/openactive/open-sessions/badge.svg?branch=master)](https://coveralls.io/github/openactive/open-sessions?branch=master)

## Quick-start 

### Setup
To start the project, download and use `npm install` in the root folder to install the dependencies.
#### Configure Environment Variables
Use the .sample-env file as a template for the .env file.
##### Auth0
The app uses Auth0 for authentication, so add your keys for this into .env.

- `AUTH0_CLIENT_ID={your Auth0 ID}`
- `AUTH0_CLIENT_SECRET={your Auth0 Secret}`
- `AUTH0_CLIENT_DOMAIN={your Auth0 Domain URL}`

#### Configure Database
Postgres is currently the only storage option configured to run directly with the app, via `sequelize`. The following commands will help you to create a user and database:

- `sudo -u postgres createuser $DATABASE_USER`
- `sudo -u postgres psql`
- `ALTER USER $DATABASE_USER PASSWORD '$DATABASE_PASS';`
- `sudo -u postgres createdb $DATABASE_NAME`

Ensure that the system running your application has vars set that satisfy the above, set in `.env`.

- `DATABASE_USER=user`
- `DATABASE_PASS=pass`
- `DATABASE_NAME=db`
- `DATABASE_HOST=host`
- `DATABASE_URL=postgres://user:pass@host:5432/db`

### Running
Run the server with `npm start`. After a few seconds, the server should be up and running and give you the access URLs for your app.

### Contributing
Test coverage can be managed by maintaining various files like `*.test.js` or `test/*.js` throughout the codebase, using [Enzyme Shallow](https://github.com/airbnb/enzyme/blob/master/docs/api/shallow.md) and [Jasmine](http://jsfiddle.net/lucassus/4DrrW/) to test components.