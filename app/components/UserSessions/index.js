import React, { PropTypes } from 'react';

import Session from '../Session';

import { timeAgo } from '../../utils/calendar';

import styles from './styles.css';

export default class UserSessions extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    user: PropTypes.object,
    sessions: PropTypes.array
  }
  constructor() {
    super();
    this.state = { isExpanded: false };
  }
  render() {
    const { user, sessions } = this.props;
    const { isExpanded } = this.state;
    return (<div>
      <div className={styles.userSessions}>
        <span>
          {user.picture ? <img src={user.picture} className={styles.userIcon} role="presentation" /> : null}
          {user.nickname || user.name ? <span className={styles.name}>{user.nickname || user.name}</span> : null}
          {user.email ? <a href={`mailto:${user.email}`}>{user.email}</a> : null}
        </span>
        <span>
          {sessions.length ? <span onClick={() => this.setState({ isExpanded: !isExpanded })} className={styles.sessionCount}>{sessions.length} sessions</span> : null}
        </span>
        {user.last_login ? <span className={styles.lastLogin}>last login {timeAgo(user.last_login)}</span> : null}
      </div>
      {isExpanded ? <div className={styles.sessions}>{sessions.map(s => <Session session={s} />)}</div> : null}
    </div>);
  }
}
