/*
 * LoginPage
 */

import React from 'react';
import { Link } from 'react-router';
import CSSModules from 'react-css-modules';

import { NotAuthenticated, Authenticated, LogoutLink, LoginForm } from 'react-stormpath';

import styles from './styles.css'; // eslint-disable-line no-unused-vars
import global from '../../styles/global.css';

const CSSModulesOptions = {
  allowMultiple: true
}

@CSSModules(styles, CSSModulesOptions)
export default class LoginPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div styleName="page__login">
        <div className={global.l__constrained}>
          <NotAuthenticated>
          <a href="#" className={global.btn} styleName="btn--fb btn--big">Continue with Facebook</a>
            <LoginForm>
              <div styleName="input__container">
                <label htmlFor="username" styleName="input--label">Username</label>
                <input type="type" name="username" id="username" styleName="input--text" placeholder="e.g. joe@gmail.com" />
              </div>
            </LoginForm>
            <p>Or <Link to="/register">register</Link></p>
          </NotAuthenticated>
          <Authenticated>
            <p>You are already logged in!</p>
            <p>Head to your <Link to="/me">profile</Link> or <LogoutLink />.</p>
          </Authenticated>
        </div>
      </div>
    );
  }
}

