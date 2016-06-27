import React from 'react';
import { Link } from 'react-router';

import getUserToken from 'containers/App/getUserToken'; // eslint-disable-line no-unused-vars

import styles from './styles.css';

class Header extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: React.PropTypes.object,
    lock: React.PropTypes.object,
  }
  constructor() {
    super();
    this.showLock = this.showLock.bind(this);
  }
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (this.context.user == null && nextContext.user != null) {
      return true;
    } else if (this.context.user != null && nextContext.user == null) {
      return true;
    }
    return false;
  }
  showLock() {
    const { lock } = this.context;
    lock.show();
  }
  renderLoginButton() {
    const { user } = this.context;
    let loginButton = <button onClick={this.showLock}>Login</button>;
    if (user) {
      const name = user.nickname;
      let image = null;
      if (user.picture) {
        image = (<img src={user.picture} className={styles.userIcon} role="presentation" />);
      }
      loginButton = (<Link to="/profile">Hey there {name}! {image}</Link>);
    }
    return loginButton;
  }
  render() {
    return (
      <header className={styles.header}>
        <div className={styles.pageMargin}>
          <Link to="/" className={styles.logoLink}>
            <img src="/images/open-sessions.svg" alt="Open Sessions" />
            <img src="/images/beta.svg" alt="beta" className={styles.beta} />
          </Link>
          <nav className={styles.nav}>
            <Link to="/session/add" activeClassName="active">+ Add a session</Link>
            {this.renderLoginButton()}
          </nav>
        </div>
      </header>
    );
  }
}

export default Header;
