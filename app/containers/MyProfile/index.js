import React from 'react';

import OrganizerView from '../OrganizerView';

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
    this.onOrganizerChange = this.onOrganizerChange.bind(this);
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
  onOrganizerChange(event) {
    const { value } = event.target;
    console.log('onOrganizerChange', value);
    this.setState({ selectedOrganizer: value });
  }
  fetchOrganizers() {
    const self = this;
    const { user } = this.context;
    apiFetch('/api/organizer', {
      query: { owner: user.user_id },
    }).then((result) => {
      const organizers = result.instances;
      const selectedOrganizer = organizers[0].uuid;
      apiFetch(`/api/session?owner=${user.user_id}&OrganizerUuid=null`).then((sessionResult) => {
        let sessions;
        let error;
        if (sessionResult.error) {
          error = sessionResult.error;
        } else if (sessionResult.instances) {
          sessions = sessionResult.instances;
        }
        self.setState({ selectedOrganizer, organizers, sessions, error });
      });
    });
  }
  renderOrganizers() {
    const { sessions, organizers, selectedOrganizer } = this.state;
    if (!organizers.length) return (<div>No organizers yet</div>);
    const organizer = organizers.filter((item) => item.uuid === selectedOrganizer)[0];
    return <OrganizerView organizer={organizer} unassignedSessions={sessions} organizerList={organizers} onOrganizerChange={this.onOrganizerChange} />;
  }
  render() {
    return (<div>
      <Authenticated message="You must be logged on to view your profile">
        {this.renderOrganizers()}
        <div className={styles.container}>
          <p><LogoutLink value="Log out" /></p>
        </div>
      </Authenticated>
    </div>);
  }
}
