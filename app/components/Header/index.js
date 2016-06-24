/*
 * Header
 */

import React from 'react';
import CSSModules from 'react-css-modules';
import { Link } from 'react-router';

import getUserToken from 'containers/App/getUserToken';

import styles from './styles.css'; // eslint-disable-line no-unused-vars

class Header extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.showLock = this.showLock.bind(this);
  }

  static contextTypes = {
    user: React.PropTypes.object,
    lock: React.PropTypes.object,
  }

  showLock() {
    const {lock} = this.context;
    lock.show();
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (this.context.user == null && nextContext.user != null) {
      return true;
    } else if (this.context.user != null && nextContext.user == null) {
      return true;
    }
    return false;
  }

  renderLoginButton() {
    const {user} = this.context;
    if (user) {
      const name = user.nickname;
      return <Link to="/profile">Hey there {name}!</Link>
    } else {
      return <button onClick={this.showLock}>Login</button>
    }
  }

  render() {
    return (
      <header styleName="app__header" className="l__constrained">
        <Link to="/" styleName="header__logo"><img src="/images/open-sessions-logo.png" alt="Open Sessions" /></Link>
        <nav className={styles.header__nav}>
          <Link to="/session/add" activeClassName="active">+ Add a session</Link>
          {this.renderLoginButton()}
        </nav>
      </header>
    );
  }
}

export default CSSModules(Header, styles);

// react-css-modules seems to have a bug when using styleName to refer to className in styles.css, so switched to using className={styles.class} for now
// Issue started by others affected: https://github.com/gajus/react-css-modules/issues/107
// TODO: fix and re-implement react-css-modules

// export default Header;
