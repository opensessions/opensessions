import React from 'react';
import { Link } from 'react-router';

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
  showLock() {
    const { lock } = this.context;
    lock.show();
  }
  renderLoginButton() {
    const { user } = this.context;
    if (!user) return <button onClick={this.showLock}>Login</button>;
    const name = user.nickname;
    let image = null;
    if (user.picture) {
      image = (<img src={user.picture} alt={name} className={styles.userIcon} />);
    }
    return <Link to="/profile">Hey there {name}! {image}</Link>;
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
            <Link to="/session/add" activeClassName="active"><span className={styles.plus}>+</span> Add a session</Link>
            {this.renderLoginButton()}
          </nav>
        </div>
      </header>
    );
  }
}

export default Header;
