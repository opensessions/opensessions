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
  duplicate = () => {
    const { session } = this.props;
    apiModel.action('session', session.uuid, 'duplicate').then(response => {
      if (response.status === 'success') {
        alert('Duplicated session: ', response.instance.href);
        window.location = response.instance.href;
      } else {
        alert('Failed to duplicate session');
      }
    });
  }
  renderActions() {
    const { session } = this.props;
    const isPublished = session.state === 'published';
    const actions = [];
    if (this.isOwner()) {
      if (!isPublished) actions.push({ key: 'edit', item: <Link to={`${session.href}/edit`}>Edit</Link> });
      actions.push({ key: 'copy', item: <a onClick={this.duplicate}>Duplicate</a> });
      actions.push({ key: 'delete', item: <a onClick={this.delete} className={styles.delete}>Delete</a> });
    } else {
      actions.push({ key: session.href, item: <Link to={session.href}>View</Link> });
    }
    return (<ol className={styles.actions}>
      {actions.map(action => <li key={action.key}>{action.item}</li>)}
    </ol>);
  }
  renderAddSchedule() {
    if (!this.isOwner()) return (<li>No schedule yet</li>);
    return (<li className={styles.addSchedule}>
      <Link to={`${this.props.session.href}/edit`}><b>+</b> Add a schedule</Link>
    </li>);
  }
  renderSchedule(occurrence, key) {
    const date = parseSchedule(occurrence);
    return (<li className={`${styles.schedule} ${date.hasOccurred ? styles.occurred : null}`} key={key}>
      <CalendarSvg />
      <span>{date.date} {date.time ? <span className={styles.time}>at {date.time}</span> : null}</span>
      <span>{date.hasOccurred ? ' (Past)' : ''}</span>
    </li>);
  }
  render() {
    if (this.state && this.state.isDeleted) return null;
    const { session } = this.props;
    let { state } = session;
    if (state === 'unpublished') state = 'draft';
    let schedules = [];
    if (session.schedule) {
      schedules = session.schedule.map(this.renderSchedule);
    }
    if (session.startDate || session.startTime) {
      schedules.push(this.renderSchedule(session, 'raw'));
    }
    return (<article className={styles.tile}>
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
          <div className={`${styles.state} ${state === 'published' ? styles.live : ''}`}>{state}</div>
        </div>
      </div>
      <div className={styles.schedules}>
        <div>{schedules.length} SCHEDULED</div>
        <ol>
          {schedules.length ? schedules : this.renderAddSchedule()}
        </ol>
      </div>
    </article>);
  }
}
