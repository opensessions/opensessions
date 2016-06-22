let config = {};

config.facebook = {
    appId:          process.env.FACEBOOK_APPID          || '235894766795945',
    appSecret:      process.env.FACEBOOK_APPSECRET      || '1c9c8e2d9bc96f38142207cf4d430f40',
    appNamespace:   process.env.FACEBOOK_APPNAMESPACE   || 'opensessions',
    redirectUri:    process.env.FACEBOOK_REDIRECTURI    || 'http://localhost:3000/login/callback'
};
