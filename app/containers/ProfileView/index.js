/*
 * HomePage
 */

import React from 'react';

import { Authenticated, LogoutLink } from 'react-stormpath';

export default class ProfileView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: React.PropTypes.object,
  }
  render() {
    const user = this.context.user ? this.context.user : null;
    return (
      <div>
        <Authenticated>
          <p>Hello, {user ? user.givenName : ''}!</p>
          <p><LogoutLink>Log out</LogoutLink></p>
        </Authenticated>
      </div>
    );
  }
}
