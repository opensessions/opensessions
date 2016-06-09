/*
 * ForgotPage
 */

import React from 'react';

import { Authenticated, NotAuthenticated, ResetPasswordForm } from 'react-stormpath';

export default class ForgotPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <NotAuthenticated>
          <p>Send an email</p>
          <ResetPasswordForm />
        </NotAuthenticated>
        <Authenticated>
          <p>You are already logged in!</p>
        </Authenticated>
      </div>
    );
  }
}
