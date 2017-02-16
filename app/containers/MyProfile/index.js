import React, { PropTypes } from 'react';

import OrganizerView from '../OrganizerView';

import CalendarView from '../../components/CalendarView';
import SessionMini from '../../components/SessionMini';
import Authenticated from '../../components/Authenticated';
import LoadingMessage from '../../components/LoadingMessage';
import SessionList from '../../containers/SessionList';

import { apiModel } from '../../utils/api';

import styles from './styles.css';

export default class MyProfile extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    location: PropTypes.object,
  };
  static contextTypes = {
    store: PropTypes.object,
    user: PropTypes.object,
    notify: PropTypes.func
  };
  static childContextTypes = {
    onExpire: PropTypes.func
  };
  static fetchData = (dispatch, user) => apiModel.search('organizer', { canAct: 'edit', depth: 1 }).then(result => {
    dispatch({ type: 'PROFILE_ORGANIZERS_LOADED', payload: result.instances });
    return apiModel.search('session', { owner: user.user_id, OrganizerUuid: 'null' }).then(sessionResult => {
      const { instances, error } = sessionResult;
      if (error) throw Error(error);
      dispatch({ type: 'PROFILE_SESSIONS_LOADED', payload: instances });
    });
  })
  constructor() {
    super();
    this.state = { isLoading: false };
  }
  getChildContext() {
    return {
      onExpire: () => this.fetchData()
    };
  }
  componentDidMount() {
    if (this.context.user) {
      this.fetchData();
    } else {
      setTimeout(() => {
        this.fetchData();
      }, 1000);
    }
  }
  onOrganizerChange = event => {
    const { value } = event.target;
    this.setState({ selectedOrganizer: value });
  }
  getSessions() {
    return this.context.store.getState().get('profileSessionsList') || [];
  }
  getOrganizers() {
    return this.context.store.getState().get('profileOrganizersList') || [];
  }
  getOrganizer() {
    const { selectedOrganizer } = this.state;
    const organizers = this.getOrganizers();
    return organizers.find(org => org.uuid === selectedOrganizer) || organizers[0];
  }
  fetchData() {
    this.setState({ isLoading: true });
    this.constructor.fetchData(this.context.store.dispatch, this.context.user).then(() => {
      this.setState({ isLoading: false });
    }).catch(error => {
      this.context.notify(error, 'error');
    });
  }
  renderOrganizers() {
    const { isLoading } = this.state;
    const sessions = this.getSessions();
    const organizers = this.getOrganizers();
    if (organizers && organizers.length) return <OrganizerView organizer={this.getOrganizer()} unassignedSessions={sessions} organizerList={organizers} onOrganizerChange={this.onOrganizerChange} />;
    if (isLoading) return <LoadingMessage message="Loading organisers" ellipsis />;
    return <SessionList sessions={sessions} />;
  }
  renderCalendar() {
    const { isLoading } = this.state;
    if (isLoading) return <LoadingMessage message="Loading calendar" ellipsis />;
    const sessions = this.getSessions();
    const organizers = this.getOrganizers();
    const renderItem = s => <SessionMini session={s} />;
    // const allSessions = sessions.concat.apply(sessions, organizers ? organizers.map(o => o.Sessions) : []);
    const allSessions = sessions.concat(...(organizers ? organizers.map(o => o.Sessions) : []));
    return (<div className={styles.container}>
      <h1>Schedule</h1>
      <p>This is the calendar of all your sessions:</p>
      <CalendarView items={allSessions} itemToDates={i => i.sortedSchedule.map(s => new Date(s.start))} month={(new Date()).toISOString().substr(0, 7)} renderItem={renderItem} />
    </div>);
  }
  render() {
    return (<Authenticated message="You must be logged on to view your profile" button="Log in">
      {this.props.location.pathname.match(/calendar/) ? this.renderCalendar() : this.renderOrganizers()}
    </Authenticated>);
  }
}
