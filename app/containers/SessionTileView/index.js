import React from 'react';
import { Link } from 'react-router';

import CalendarSvg from 'components/CalendarSvg';

import { parseSchedule } from 'utils/postgres';
import { apiModel } from 'utils/api';

import styles from './styles.css';

export default class SessionTileView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    session: React.PropTypes.object,
  }
  static contextTypes = {
    user: React.PropTypes.object,
  }
  getTitle() {
    const { session } = this.props;
    return `${session.title ? session.title : '(Untitled)'}`;
  }
  isOwner() {
    const { session } = this.props;
    const { user } = this.context;
    return user && session.owner === user.user_id;
  }
  delete = () => {
    const { session } = this.props;
    if (confirm('Are you sure you want to delete?', 'Delete', 'Cancel')) {
      apiModel.delete('session', session.uuid).then(response => {
        if (response.status === 'success') {
          this.setState({ isDeleted: true });
        } else {
          alert('Failed to delete session');
        }
      });
    }
  }
  renderActions() {
    const { session } = this.props;
    const actions = [
      { key: session.href, item: <Link to={session.href}>View</Link> }
    ];
    if (this.isOwner()) {
      actions.push({ key: 'edit', item: <Link to={`${session.href}/edit`}>Edit</Link> });
      actions.push({ key: 'delete', item: <a onClick={this.delete} className={styles.delete}>Delete</a> });
    }
    return (<ol className={styles.actions}>
      {actions.map((action) => <li key={action.key}>{action.item}</li>)}
    </ol>);
  }
  renderAddSchedule() {
    if (!this.isOwner()) return (<li>No schedule yet</li>);
    return (<li className={styles.addSchedule}>
      <Link to={`${this.props.session.href}/edit`}><b>+</b> Add a schedule</Link>
    </li>);
  }
  render() {
    if (this.state && this.state.isDeleted) return null;
    const { session } = this.props;
    let { state } = session;
    const stateDisplayNames = { published: 'live', unpublished: 'draft' };
    if (state in stateDisplayNames) state = stateDisplayNames[state];
    const date = parseSchedule(session);
    const schedules = [];
    if (date.date || date.time) {
      schedules.push(<li className={`${styles.schedule} ${date.hasOccurred ? styles.occurred : null}`} key="schedule1">
        <CalendarSvg />
        <span>{date.date} {date.time ? <span className={styles.time}>at {date.time}</span> : null}</span>
        <span>{date.hasOccurred ? ' (Past)' : ''}</span>
      </li>);
    }
    return (
      <article className={styles.tile}>
        <div className={styles.imgCol}>
          <img src={session.image ? session.image : '/images/placeholder.png'} role="presentation" />
        </div>
        <div className={styles.textCol}>
          <div className={styles.info}>
            <h1><Link to={session.href}>{this.getTitle()}</Link></h1>
            <div className={styles.location}>{session.location}</div>
          </div>
          <div className={styles.actions}>
            {this.renderActions()}
            <div className={`${styles.state} ${state === 'live' ? styles.live : ''}`}>{state}</div>
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
