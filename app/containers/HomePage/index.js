import React from 'react';

import Authenticated from 'components/Authenticated';
import SessionList from 'containers/SessionList';
import LoadingMessage from 'components/LoadingMessage';

import styles from './styles.css';

export default class HomePage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: React.PropTypes.object,
    lock: React.PropTypes.object,
  };
  static childContextTypes = {
    user: React.PropTypes.object,
    lock: React.PropTypes.object,
  };
  getChildContext() {
    return {
      lock: this.context.lock,
      user: this.context.user,
    };
  }
  renderSessionList() {
    const { user } = this.context;
    if (!user) return <LoadingMessage message="Loading user" ellipsis />;
    return <SessionList query={`owner=${user.user_id}`} />;
  }
  render() {
    return (<div className={styles.container}>
      <h1>Welcome to Open Sessions!</h1>
      <Authenticated message="Login to add a session!" button="Login">
        {this.renderSessionList()}
      </Authenticated>
    </div>);
  }
}
