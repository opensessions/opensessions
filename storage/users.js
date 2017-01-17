const { ManagementClient } = require('auth0');
const { AUTH0_CLIENT_TOKEN, AUTH0_CLIENT_DOMAIN } = process.env;

const authClient = new ManagementClient({
  token: AUTH0_CLIENT_TOKEN,
  domain: AUTH0_CLIENT_DOMAIN
});

const pageUsers = (page, allUsers) => {
  const perPage = 100;
  return authClient.getUsers({ per_page: perPage, page }).then(users => {
    if (users.length === perPage) return pageUsers(page + 1, allUsers.concat(users));
    return allUsers.concat(users);
  });
};

const getAllUsers = () => {
  const page = 0;
  const allUsers = [];
  return pageUsers(page, allUsers);
};

module.exports = { authClient, getAllUsers };
