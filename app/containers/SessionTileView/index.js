import React from 'react';
import { Link } from 'react-router';

import { parseSchedule } from 'utils/postgres';

import styles from './styles.css';

export default class SessionTileView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    session: React.PropTypes.object,
  }
  static contextTypes = {
    user: React.PropTypes.object,
  }
  renderActions() {
    const { session } = this.props;
    const { user } = this.context;
    const actions = [
      { href: session.href, text: 'View' }
    ];
    if (user && session.owner === user.user_id) actions.push({ href: `${session.href}/edit`, text: 'Edit' });
    return (<div>
      <ol className={styles.actions}>{actions.map((action) => <li key={action.href}><Link to={action.href}>{action.text}</Link></li>)}</ol>
    </div>);
  }
  render() {
    const { session } = this.props;
    const date = parseSchedule(session);
    return (
      <article className={styles.tile}>
        <div className={styles.imgCol}>
          <img src="/images/placeholder.png" role="presentation" />
        </div>
        <div className={styles.textCol}>
          <h1><Link to={session.href}>{session.displayName}</Link></h1>
          <div className={styles.location}>{session.location}</div>
          <div>{this.renderActions()}</div>
          <div className={styles.state}>{session.state}</div>
        </div>
        <div className={styles.schedules}>
          <div>1 schedule</div>
          <ol>
            <li><img src="/images/calendar.svg" role="presentation" /> {date.date} at {date.time}</li>
          </ol>
        </div>
      </article>
    );
  }
}
