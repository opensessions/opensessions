/*
 * RegisterPage
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a neccessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';

import Field from 'components/Field';
import { Link } from 'react-router';
import CSSModules from 'react-css-modules';

import { Authenticated, NotAuthenticated, RegistrationForm, LogoutLink } from 'react-stormpath';

import styles from '../LoginPage/styles.css'; // eslint-disable-line no-unused-vars

const CSSModulesOptions = {
  allowMultiple: true,
};

@CSSModules(styles, CSSModulesOptions)

export default class RegisterPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div styleName="page__loginRegister">
        <div className="l__constrained" styleName="page__content">
          <NotAuthenticated>
            <a href="#" className="btn" styleName="btn--fb">Continue with Facebook</a>
            <div styleName="decoration--or">
              <span styleName="or--label">or</span>
            </div>
            <span styleName="decoration--continue">Create your Open Sessions account</span>
            <RegistrationForm>
              <Field label="Email" name="email" />
              <Field label="Choose a password" type="password" name="password" />
              <Field label="Re-type password" type="password" name="confirm-password" />
              <p spIf="form.error">
                <strong>Error:</strong><br />
                <span spBind="form.errorMessage" />
              </p>
              <input type="submit" value="Create Account" className="btn btn__submit" styleName="btn__submit" />
            </RegistrationForm>
            <Link to="/login" styleName="link__create-account">I already have an account</Link>
          </NotAuthenticated>
          <Authenticated>
            <h1 className="alpha">You are already logged in!</h1>
            <p>Head to your <Link to="/me">profile</Link> or you can <LogoutLink />.</p>
          </Authenticated>
        </div>
      </div>
    );
  }
}
