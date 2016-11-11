const exampleUser = {
  email: 'oli@imin.co',
  email_verified: true,
  name: 'Oliver Beatson',
  given_name: 'Oliver',
  family_name: 'Beatson',
  picture: 'https://lh5.googleusercontent.com/-aGr61JikdvY/AAAAAAAAAAI/AAAAAAAAAAw/vcvxIHZVlIQ/photo.jpg',
  locale: 'en-GB',
  updated_at: '2016-06-28T11:00:51.488Z',
  user_id: 'google-oauth2|100229880746808785817',
  nickname: 'oli',
  identities: [
    {
      user_id: '100229880746808785817',
      provider: 'google-oauth2',
      connection: 'google-oauth2',
      isSocial: true
    }
  ],
  created_at: '2016-06-24T10:59:33.581Z',
  last_ip: '82.163.127.74',
  last_login: '2016-06-28T11:00:51.488Z',
  logins_count: 12
};

const { ManagementClient } = require('auth0');
const api = new ManagementClient({
  token: process.env.AUTH0_CLIENT_TOKEN,
  domain: process.env.AUTH0_CLIENT_DOMAIN
});

module.exports = (email, models) => {
  console.log(exampleUser);
  api.getUsers().then(users => {
    users.forEach(user => {
      const sessions = models.Session.findAll({ owner: user.user_id });
      sessions.forEach(session => {
        if (session.state === 'published') {
          if (session.schedule) {
            // if it expired within the last week
            // email('Your session is about to expire!');
          }
        }
      });
    });
  });
};
