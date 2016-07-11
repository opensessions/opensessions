import React from 'react';
import { Link } from 'react-router';

import LoginButton from 'components/LoginButton';

import styles from './styles.css';

export default class Header extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: React.PropTypes.object,
    lock: React.PropTypes.object,
  }
  static propTypes = {
    lock: React.PropTypes.object,
  }
  renderLoginButton() {
    const { user } = this.context;
    if (!user) return <LoginButton lock={this.props.lock}>Login</LoginButton>;
    const name = user.nickname;
    const greet = 'Hello,';
    const image = user.picture ? <img src={user.picture} alt={name} className={styles.userIcon} /> : null;
    return <Link to="/profile">{greet} {name}! {image}</Link>;
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
