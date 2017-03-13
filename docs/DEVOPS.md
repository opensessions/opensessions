# Setup

## Heroku

We mostly use the graphical user interface to check out how automatic commits to master have turned out (heroku runs build automatically and travis I believe does testing on this, tho our tests aren't particularly indicative of a useful app yet -- see CONTRIBUTING.md). Promotion to live is done manually via the app's pipeline. There are heroku-cli commands to do all these things if you wanna. Env vars are under the `Settings` tab on the App view.

# Debugging

## App logs

### Heroku

- Make sure your heroku credentials are setup on your computer via ssh key so that you can use the heroku-cli (https://devcenter.heroku.com/articles/keys)
- Use `heroku logs --app ${APP_NAME}` to view the logs. Add `--tail` flag to read continuously.
- SSH into the machine to root around if anything's going really crazy with `heroku run bash` (I've never done this and suspect you'll never have cause to - red flag if you need to do this in write mode!).

### Other platforms
TBC

## Database access
Database connection details will be found in the environment setup under `DATABASE_URL`. In heroku this is findable under the `App -> Settings` tab in the `Config Variables` section (https://dashboard.heroku.com/apps/${APP_NAME}/settings).