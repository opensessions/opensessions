/*
 * RegisterPage
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a neccessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';

import { RegistrationForm } from 'react-stormpath';

export default class LoginPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <div>
          <h1>This is the registration form!</h1>
          <RegistrationForm />
        </div>
      </div>
    );
  }
}
