/*
 * LoginPage
 */

import React from 'react';
import { Link } from 'react-router';

import { NotAuthenticated, Authenticated, LogoutLink, LoginForm } from 'react-stormpath';

import styles from './styles.css'; // eslint-disable-line no-unused-vars

export default class LoginPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <NotAuthenticated>
          <h1>This is the login form!</h1>
          <LoginForm />
          <p>Or <Link to="/register">register</Link></p>
        </NotAuthenticated>
        <Authenticated>
          <p>You are already logged in!</p>
          <p>Head to your <Link to="/me">profile</Link> or <LogoutLink />.</p>
        </Authenticated>
      </div>
    );
  }
}
