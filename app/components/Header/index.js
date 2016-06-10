/*
 * Header
 */

import React from 'react';
import CSSModules from 'react-css-modules';
import { Link } from 'react-router';

import styles from './styles.css'; // eslint-disable-line no-unused-vars
import global from '../../styles/global.css';

import { NotAuthenticated, LoginLink, Authenticated } from 'react-stormpath';

class Header extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: React.PropTypes.object,
  }
  render() {
    const user = this.context.user ? this.context.user : false;
    return (
      <header styleName="app__header" className={global.l__constrained}>
        <Link to="/" styleName="header__logo" className="grid__col">Open Sessions</Link>
        <nav className={styles.header__nav}>
          <Link to="/session/add" activeClassName="active">+ add session</Link>
          <NotAuthenticated>
            <LoginLink>log in</LoginLink>
          </NotAuthenticated>
          <Authenticated>
            <Link to="/me">{user.givenName}'s profile</Link>
          </Authenticated>
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
