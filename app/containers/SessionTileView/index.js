import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import CalendarSVG from '../../components/SVGs/Calendar';

import { parseSchedule } from '../../utils/calendar';
import { apiModel } from '../../utils/api';

import styles from './styles.css';

export default class SessionTileView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    session: PropTypes.object,
  };
  static contextTypes = {
    user: PropTypes.object,
    router: PropTypes.object,
    notify: PropTypes.func,
  }
  getTitle() {
    const { session } = this.props;
    return session.title || <i>Untitled</i>;
  }
  isOwner() {
    const { session } = this.props;
    const { user } = this.context;
    return user && session.owner === user.user_id;
  }
  delete = () => {
    const { session } = this.props;
    this.context.notify('Are you sure you want to delete?', 'error', [{
      text: 'Delete',
      dispatch: () => apiModel.delete('session', session.uuid).then(response => {
        if (response.status === 'success') {
          this.setState({ isDeleted: true });
          this.context.notify('Session deleted', 'success');
        } else {
          throw new Error('Failed to delete session');
        }
      }).catch(() => {
        this.context.notify('Failed to delete session', 'error');
      })
    }]);
  }
  duplicate = () => {
    const { session } = this.props;
    this.context.notify('Are you sure you want to duplicate this session?', null, [{
      text: 'Duplicate',
      dispatch: () => apiModel.action('session', session.uuid, 'duplicate').then(response => {
        if (response.status === 'success') {
          this.context.notify('Session duplicated', 'success');
          this.context.router.push(response.instance.href);
        } else {
          throw new Error('Failed to duplicate session');
        }
      }).catch(() => {
        this.context.notify('Failed to duplicate session', 'error');
      })
    }]);
  }
  renderActions() {
    const { session } = this.props;
    const actionTypes = {
      edit: <Link to={`${session.href}/edit`}>Edit</Link>,
      view: <Link to={session.href}>View</Link>,
      duplicate: <a onClick={this.duplicate}>Duplicate</a>,
      delete: <a onClick={this.delete} className={styles.delete}>Delete</a>
    };
    const actions = session.actions.length ? session.actions : ['view'];
    return (<ol className={styles.actions}>
      {actions.map(key => <li key={key}>{actionTypes[key]}</li>)}
    </ol>);
  }
  renderAddSchedule() {
    if (!this.isOwner()) return (<li>No schedule yet</li>);
    return (<li className={styles.addSchedule}>
      <Link to={`${this.props.session.href}/edit/schedule`}><b>+</b> Add a schedule</Link>
    </li>);
  }
  renderSchedule(occurrence, key) {
    const date = parseSchedule(occurrence);
    return (<li className={[styles.schedule, date.hasOccurred ? styles.occurred : null].join(' ')} key={key}>
      <CalendarSVG />
      <span>{date.date} {date.time ? <span className={styles.time}>at {date.time}</span> : null}</span>
      <span>{date.hasOccurred ? ' (Past)' : ''}</span>
    </li>);
  }
  renderGALLink(session) {
    const { locationData, Activity, location } = session;
    return <a target="blank" href={`https://beta.getactivelondon.com/results/list?activity=${Activity ? Activity.name : ''}&location=${location}&lat=${locationData ? locationData.lat : ''}&lng=${locationData ? locationData.lng : ''}&radius=4&sortBy=distance`} className={styles.GALLink}>GAL</a>;
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
    return (<article className={styles.tile}>
      <div className={styles.imgCol}>
        <img src={session.image ? session.image : '/images/placeholder.png'} role="presentation" className={!session.image ? styles.noImage : null} />
      </div>
      <div className={styles.textCol}>
        <div className={styles.info}>
          <h1><Link to={session.href}>{this.getTitle()}</Link> {this.renderGALLink(session)}</h1>
          <div className={styles.location}>{session.location}</div>
        </div>
        <div className={styles.meta}>
          {this.renderActions()}
          <div className={[styles.state, state === 'published' ? styles.live : ''].join(' ')}>{state}</div>
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
