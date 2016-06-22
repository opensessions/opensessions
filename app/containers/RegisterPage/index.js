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

import { Authenticated, NotAuthenticated, RegistrationForm, LogoutLink, SocialLoginLink } from 'react-stormpath';

import styles from '../LoginPage/styles.css'; // eslint-disable-line no-unused-vars

const CSSModulesOptions = {
  allowMultiple: true,
};

@CSSModules(styles, CSSModulesOptions)

export default class RegisterPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      fields: ['email', 'password', 'passwordcheck'],
    };
  }
  onSubmit(e, next) {
    // e is the response data, next is the callback
    this.state.fields.forEach((field) => {
      const fieldValue = this.refs[field].state.value;
      this.refs[field].isValid(fieldValue);
    });
    next();
  }
  render() {
    return (
      <div styleName="page__loginRegister">
        <div className="l__constrained" styleName="page__content">
          <NotAuthenticated>
            <SocialLoginLink className="btn" styleName="btn--fb" providerId='facebook'>Continue with Facebook</SocialLoginLink>
            <div styleName="decoration--or">
              <span styleName="or--label">or</span>
            </div>
            <span styleName="decoration--continue">Create your Open Sessions account</span>
            <RegistrationForm onSubmit={this.onSubmit}>
              <Field ref="email" name="email" label="Email" />
              <Field ref="password" type="password" name="password" label="Password" />
              <Field ref="passwordcheck" type="password" name="passwordcheck" label="Retype Password" />
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
