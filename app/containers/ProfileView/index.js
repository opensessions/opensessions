/*
 * HomePage
 */

import React from 'react';
import Header from 'components/Header';

import { Link } from 'react-router';

import { Authenticated } from 'react-stormpath';

export default class ProfileView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: React.PropTypes.object
  }
  render() {
    var user = this.context.user ? this.context.user : null;
    return (
      <div>
        <Header />
        <Authenticated>
          <p>Hello, {user ? user.givenName : ""}!</p>
        </Authenticated>
      </div>
    );
  }
}
