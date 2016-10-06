import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import LoginButton from 'components/LoginButton';
import Sticky from 'components/Sticky';

import styles from './styles.css';

export default class Header extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: PropTypes.object,
    locks: PropTypes.object,
  }
  renderLoginButton() {
    const { user } = this.context;
    if (!user) return <LoginButton lock={this.context.locks.login}>Login</LoginButton>;
    const { nickname } = user;
    return <Link to="/profile">Hello, {nickname}! {user.picture ? <img src={user.picture} role="presentation" className={styles.userIcon} /> : null}</Link>;
  }
  render() {
    const addSession = <span><span className={styles.plus}>+</span> Add a session</span>;
    return (<Sticky zIndex={2}><header className={styles.header}>
      <div className={styles.pageMargin}>
        <Link to="/" className={styles.logoLink}>
          <img src="/images/open-sessions.svg" alt="Open Sessions" className={styles.logo} />
          <img src="/images/beta.svg" alt="beta" className={styles.beta} />
        </Link>
        <nav className={styles.nav}>
          {this.context.user ? <Link to="/session/add">{addSession}</Link> : <LoginButton lock={this.context.locks.signup}>{addSession}</LoginButton>}
          {this.renderLoginButton()}
        </nav>
      </div>
    </header></Sticky>);
  }
}
