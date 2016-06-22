# Open Sessions [![Build Status](https://travis-ci.org/openactive/open-sessions.svg?branch=master)](https://travis-ci.org/openactive/open-sessions) [![Coverage Status](https://coveralls.io/repos/github/openactive/open-sessions/badge.svg?branch=master)](https://coveralls.io/github/openactive/open-sessions?branch=master)

## Quick-start 

### Setup
To start the project, download and use `npm install` in the root folder to install the dependencies.
#### Configure Stormpath Environment Variables
Use the .sample-env file as a template for the .env file. Get the 3 stormpath keys and add them to a new .env file. The project will not build without these set.
#### Configure Database
Postgres is currently the only storage option configured to run directly with the app. The following commands will help you to create a user and database:

- `sudo -u postgres createuser $OPENSESSIONS_PG_USER`
- `sudo -u postgres psql`
- `ALTER USER ${this.user.username} PASSWORD '$OPENSESSIONS_PG_PASS';`
- `sudo -u postgres createdb $OPENSESSIONS_PG_DB`

Ensure that the system running your application has vars set that satisfy the above.
### Running
Run the server with `npm start`. After a few seconds, the server should be up and running and give you the access URLs for your app.
