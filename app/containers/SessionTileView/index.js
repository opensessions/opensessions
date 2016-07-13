import React from 'react';
import { Link } from 'react-router';

import CalendarSvg from 'components/CalendarSvg';

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
    return (<ol className={styles.actions}>
      {actions.map((action) => <li key={action.href}><Link to={action.href}>{action.text}</Link></li>)}
    </ol>);
  }
  renderAddSchedule() {
    return (<li className={styles.addSchedule}>
      <Link to={`${this.props.session.href}/edit`}><b>+</b> Add a schedule</Link>
    </li>);
  }
  render() {
    const { session } = this.props;
    const date = parseSchedule(session);
    let stateStyle = styles.state;
    if (session.state === 'published') stateStyle = `${stateStyle} ${styles.live}`;
    const schedules = [];
    if (date.date || date.time) {
      schedules.push(<li className={styles.schedule}>
        <CalendarSvg />
        <span>{date.date} <span className={styles.time}>at {date.time}</span></span>
      </li>);
    }
    return (
      <article className={styles.tile}>
        <div className={styles.imgCol}>
          <img src="/images/placeholder.png" role="presentation" />
        </div>
        <div className={styles.textCol}>
          <div className={styles.info}>
            <h1><Link to={session.href}>{session.displayName}</Link></h1>
            <div className={styles.location}>{session.location}</div>
          </div>
          <div className={styles.actions}>
            {this.renderActions()}
            <div className={stateStyle}>{session.state}</div>
          </div>
        </div>
        <div className={styles.schedules}>
          <div>{schedules.length} SCHEDULED</div>
          <ol>
            {schedules.length ? schedules : this.renderAddSchedule()}
          </ol>
        </div>
      </article>
    );
  }
}
