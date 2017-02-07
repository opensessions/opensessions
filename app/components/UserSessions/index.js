import React, { PropTypes } from 'react';

import SessionTileView from '../../containers/SessionTileView';

import { cleanDate } from '../../utils/calendar';

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
    return (<div className={styles.userSessions}>
      {user.picture ? <img src={user.picture} className={styles.userIcon} role="presentation" /> : null}
      {user.nickname || user.name ? <span className={styles.name}>{user.nickname || user.name}</span> : null}
      {user.email ? <a href={`mailto:${user.email}`}>{user.email}</a> : null}
      {user.last_login ? <span className={styles.lastLogin}>last login {cleanDate(new Date(user.last_login))} ago</span> : null}
      {sessions.length ? <span onClick={() => this.setState({ isExpanded: !isExpanded })} className={styles.sessionCount}>{sessions.length} sessions</span> : null}
      {sessions.length ? <span onClick={() => alert(sessions.map(s => `${s.title}: ${s.contactName || 'no name'} ${s.contactPhone || 'no phone'}`).join('\n'))}>info</span> : null}
      {isExpanded ? <div>{sessions.map(s => <SessionTileView session={s} style="slim" />)}</div> : null}
    </div>);
  }
}
