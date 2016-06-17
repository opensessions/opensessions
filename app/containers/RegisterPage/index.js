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
  constructor() {
    super();
    this.state = {
      errors: [],
      fields: ['email', 'password', 'passwordcheck'],
    };
  };
  componentDidUpdate() {
    console.log(this.state);
  }
  onFormSubmit(e, next) {
    let errors = {};
    this.state.fields.forEach((field) => {
      console.log(this.refs[field]);
      if (this.refs[field].state.value == "") {
        errors[field] = true;
      } else {
        errors[field] = false;
      }
    });
    this.setState({ errors: errors });
    next();
  }
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
            <RegistrationForm onSubmit={this.onFormSubmit.bind(this)}>
              <Field ref="email" name="email" label="Email" error={this.state.errors['email']} /> 
              <Field ref="password" type="password" name="password" label="Password" error={this.state.errors['password']} />
              <Field ref="passwordcheck" type="password" name="passwordcheck" label="Retype Password" error={this.state.errors['passwordcheck']} />
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
