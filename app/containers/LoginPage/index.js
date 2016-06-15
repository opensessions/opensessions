/*
 * LoginPage
 */

import React from 'react';

import Field from 'components/Field';

import { Link } from 'react-router';
import CSSModules from 'react-css-modules';

import { NotAuthenticated, Authenticated, LogoutLink, LoginForm } from 'react-stormpath';

import styles from './styles.css'; // eslint-disable-line no-unused-vars

const CSSModulesOptions = {
  allowMultiple: true,
};

@CSSModules(styles, CSSModulesOptions)
export default class LoginPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div styleName="page__loginRegister">
        <div className="l__constrained">
          <div styleName="form__section">
            <NotAuthenticated>
              <a href="#" className="btn" styleName="btn--fb">Continue with Facebook</a>
              <div styleName="decoration--or">
                <span styleName="or--label">or</span>
              </div>
              <span styleName="decoration--continue">Continue with email</span>
              <LoginForm>
                <div styleName="login__form">
                  <Field label="Username" name="username" />
                  <Field label="Password" name="password" />
                  <input type="submit" value="Continue" className="btn btn__submit" styleName="btn__submit" />
                </div>
              </LoginForm>
              <Link to="/register" styleName="link__create-account">Create an account</Link>
            </NotAuthenticated>
            <Authenticated>
              <h1 className="alpha">You are already logged in!</h1>
              <p>Head to your <Link to="/me">profile</Link> or you can <LogoutLink />.</p>
            </Authenticated>
          </div>
        </div>
      </div>
    );
  }
}

