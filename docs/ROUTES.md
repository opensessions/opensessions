# Route Documentation

Routes - What Do They Want to Know and Do They Return Things? Let's Find Out!

## API

The API is sensitive to the authentication of the user, which is derived from the `Authorization: bearer ${json web token}`. This identifies the user's auth0 account id. The primary effect of this is hiding sessions in draft mode from non-owners. Admin users also get additional functionality, who are defined by their auth0 email address matching the `ADMIN_DOMAIN` env var.

All responses are JSON; those returning a model instance or a list thereof payload, are given the top-level `instance` or `instances` keys respectively. TODO: use status codes and error messaging consistently.

* `/api` API root, doesn't return anything (TODO: make return API routes)
  * `/rdpe` [Realtime Paged Data Exchange](https://www.openactive.io/realtime-paged-data-exchange/) root
    * `/sessions` the paging endpoint itself
  * `/session` 
    * `/:uuid`
      * `GET` get single session's data
      * `POST` mutate session's data (if owner)
      * `/action` 
        * `/publish` set the session as published, or explain validation errors
        * `/*` other actions (TODO: document)
  * `/organizer` 
    * `/:uuid`
      * `/action` 
        * `/*` other actions (TODO: document)
  * `/activity` 
    * `/:uuid`
      * `/action` 
        * `/*` other actions (TODO: document)
  * `/partner` partner model (for Parner Portal, which gives users separate endpoint)
    * `/:uuid` 
      * `/action` 
        * `/rdpe` partner's rdpe endpoint
  * `/analysis` app analysis info (snapshots of app state recorded at specific triggers, e.g. app startup, and daily cron)
  * `/users` get all users (admin only)
* `/hooks`
  * `/feedback` `POST` Send feedback
  * `/feature` `POST` When a user clicks that they want to be talked , send us an email
  * `/feature-dialog` `POST` Let us know when a user opens a feature request dialog box
  * `/emails`
    * `/inbound` `POST` Using sendgrid to deliver emails sent to the EMAILS_INBOUND_URL, according to (sendgrid inbound parse webhook)[https://sendgrid.com/docs/API_Reference/Webhooks/inbound_email.html]

## App

* `/` Home Page
* `/profile` List of user's organizations (if logged in)
* `/session`
  * `/:uuid` View a published session (or preview a draft session, if owner)
    * `/edit` Edit a session
* `/organizer`
  * `/:{uuid|slug}` View an organizer
    * `/edit` Edit organizer
* `/sessions` List of all the site's published sessions (paged, with filters)
  * `?activity={activity name}` filter by an activity
  * `?createdAt=YYYY-MM-DD:YYYY-MM-DD` filter by createdAt time range
* `/activities` List of all the site's activities
* `/organizers` List of all the site's organizers
* `/dashboard` Admin dashboard (email, app and publishing analytics)
  * `/users` Analytics and list of users
* `/rdpe` View the RDPE graphically
* `/terms` Terms and conditions and rules and legal doublets