import React from 'react';
import { Link } from 'react-router';

import OrganizerView from '../OrganizerView';
import LogoutLink from 'components/LogoutLink';
import Authenticated from 'components/Authenticated';

import { apiFetch } from '../../utils/api';

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
    this.fetchOrganizers();
  }
  fetchOrganizers() {
    const self = this;
    const { user } = this.context;
    apiFetch('/api/organizer', {
      query: { owner: user.user_id },
    }).then((organizers) => {
      apiFetch(`/api/session?owner=${user.user_id}&OrganizerUuid=null`).then((sessions) => {
        self.setState({ organizers, sessions });
      });
    });
  }
  renderOrganizers() {
    if (this.state.organizers.length === 0) return (<div>No organizers yet</div>);
    return (<div>
      <h2>Organized sessions</h2>
      <ul>
        {this.state.organizers.map((organizer) => <li key={organizer.uuid}><OrganizerView organizer={organizer} /></li>)}
      </ul>
    </div>);
  }
  renderSessions() {
    if (this.state.sessions.length === 0) return (<div>No sessions yet</div>);
    return (<div>
      <h2>Sessions without organizers</h2>
      <ul>
        {this.state.sessions.map((session) => <li key={session.uuid}><Link to={session.href}>{session.displayName}</Link></li>)}
      </ul>
    </div>);
  }
  render() {
    const { user } = this.context;
    return (
      <div>
        <Authenticated message="You must be logged on to view your profile">
          <p>Hello, {user ? user.nickname : ''}!</p>
          <p>From here you can view your organizers and their sessions below, or (<LogoutLink value="Log out" />)</p>
          {this.renderOrganizers()}
          {this.renderSessions()}
        </Authenticated>
      </div>
    );
  }
}
