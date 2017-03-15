# Route Documentation

Routes - what do they want to know and do they return things? Let's find out!

## API

The API is sensitive to the authentication of the user, which is derived from the `Authorization: bearer ${json web token}`. This identifies the user's auth0 account id. The primary effect of this is hiding sessions in draft mode from non-owners.

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

## App

``