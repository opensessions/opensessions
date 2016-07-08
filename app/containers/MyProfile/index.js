import React from 'react';
import { Link } from 'react-router';

import OrganizerView from '../OrganizerView';
import SessionTileView from '../SessionTileView';

import LogoutLink from 'components/LogoutLink';
import Authenticated from 'components/Authenticated';

import { apiFetch } from '../../utils/api';

import styles from './styles.css';

export default class MyProfile extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: React.PropTypes.object,
    lock: React.PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.state = {
      organizers: [],
      sessions: [],
    };
  }
  componentDidMount() {
    if (this.context.user) {
      this.fetchOrganizers();
    } else {
      setTimeout(() => {
        this.fetchOrganizers();
      }, 1000);
    }
  }
  fetchOrganizers() {
    const self = this;
    const { user } = this.context;
    const newState = {};
    apiFetch('/api/organizer', {
      query: { owner: user.user_id },
    }).then((result) => {
      newState.organizers = result.instances;
      apiFetch(`/api/session?owner=${user.user_id}&OrganizerUuid=null`).then((result2) => {
        newState.sessions = result2.instances;
        self.setState(newState);
      });
    });
  }
  renderOrganizers() {
    if (!this.state.organizers.length) return (<div>No organizers yet</div>);
    return (<div>
      <h2>Organized sessions</h2>
      <ul className={styles.organizerList}>
        {this.state.organizers.map((organizer) => <li key={organizer.uuid}><OrganizerView organizer={organizer} /></li>)}
      </ul>
    </div>);
  }
  renderSessions() {
    if (!this.state.sessions.length) return null;
    return (<div>
      <h2>Sessions without organizers</h2>
      <ul className={styles.organizerList}>
        {this.state.sessions.map((session) => <li key={session.uuid}><SessionTileView session={session} /></li>)}
      </ul>
    </div>);
  }
  render() {
    const { user } = this.context;
    return (
      <div>
        <div className={styles.container}>
          <Authenticated message="You must be logged on to view your profile">
            <p>Hello, {user ? user.nickname : ''}!</p>
            <p>From here you can view your organizers and their sessions below, or <LogoutLink value="Log out" /></p>
            {this.renderOrganizers()}
            {this.renderSessions()}
          </Authenticated>
        </div>
      </div>
    );
  }
}
