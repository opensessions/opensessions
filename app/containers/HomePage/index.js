import React, { PropTypes } from 'react';

import Authenticated from 'components/Authenticated';
import NotificationBar from 'components/NotificationBar';
import SessionList from 'containers/SessionList';
import LoadingMessage from 'components/LoadingMessage';

import styles from './styles.css';

export default class HomePage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: PropTypes.object,
    notifications: PropTypes.array,
  }
  renderSessionList() {
    const { user } = this.context;
    if (!user) return <LoadingMessage message="Loading user" ellipsis />;
    return <SessionList query={`owner=${user.user_id}`} />;
  }
  render() {
    return (<div className={styles.container}>
      <NotificationBar notifications={this.context.notifications} zIndex={4} />
      <h1>Welcome to Open Sessions!</h1>
      <Authenticated message="Let's get your sessions online." button={['Sign Up', 'Login']}>
        {this.renderSessionList()}
      </Authenticated>
    </div>);
  }
}
