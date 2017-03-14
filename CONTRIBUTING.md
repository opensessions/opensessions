# Contributing to Open Sessions

Follow the setup instructions as described in the README.

## Known issues

The project suffers from dire lack of testing. Most pressing candidates for testing are the RDPE endpoint.

This could be done by constructing some mock session objects and putting them through the `sessionToRDPE` function, making sure reasonable objects are output, crucially so that the outputs don't get rejected down the line by data consumers. This would be especially useful for testing all schedule/timezone transformations, which can be quite complex as it included both env variables (the app's timezone) and time info stored in non UTC formats being turned into UTC.

The app has seemed performant so far, but a few red flags appear to me in the form of our cron jobs (not sure how these are implemented in node, but probably require a persistent process -- as opposed to the pattern of the rest of the app, which is basically a static front end and a REST api).

The universal javascript implementation is mostly bare-bones functional (check out what the search bots see by going to ?ssr=1 on any page). However, as you can see, styles aren't working - not a problem for bots, but a blocker for making the site usable for anyone we might want to serve a no-js version to (potentially IE users, if we can't get react stably working for them). Styling could potentially be made universal by migrating to `styled-components` or some other way of doing css. However, the composability of the current solution inherited from the parent `react-boilerplate` project is pretty nice and giving bots and potentially legacy users (if work is put in to making the app proper no-js support) a nice experience may not be worth it, judgement call depending.

## Project structure

- `app` front end react code, which gets compiled by webpack
- `docs` mostly inherited from `react-boilerplate`
- `internals` is webpack configs
- `server` is server code run by nodejs, with a subset compiled by webpack (./src -> ./lib)
- `storage` contains database-y code, including models, migrations and mutations
- `utils` contains logic that is shared by multiple parts of the application

### Artifacts

- `build` is created by `npm run build`
- `uploads` is where node puts temporary images when you upload stuff, before sending to s3

## Common tasks

### Adding a route

Routes are managed in `app/server/routes.js`, in a redux-store specific form that includes lazy-loading components. Copy any existing route and amend with your newly created container component from `app/containers/CoolPage/index.js`. Add a container to do data fetching (this would be good if this could be at some point more automatic, e.g. using redux createContainer conventions).

### Adding a field to session

Create a migration file with `npm run db:migration:make` (rename the produced file descriptively) and change the `up` and `down` functions to amend the database (see many examples of this being done in the `storage/migrations` directory). Then amend the model in `storage/models.js` to get the `sequelize` ORM to extract the new field properly (most db operations are auto-generated and fetch all the fields modelled in here).