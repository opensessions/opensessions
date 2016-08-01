import React from 'react';

import OrganizerView from '../OrganizerView';

import Authenticated from 'components/Authenticated';
import LoadingMessage from 'components/LoadingMessage';
import SessionList from 'containers/SessionList';

import { apiFetch } from '../../utils/api';

export default class MyProfile extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: React.PropTypes.object,
    lock: React.PropTypes.object,
    router: React.PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.state = {
      organizers: [],
      sessions: [],
      status: 'Loading organizers...'
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
  onOrganizerChange = (event) => {
    const { value } = event.target;
    this.setState({ selectedOrganizer: value });
  }
  getOrganizer() {
    const { organizers, selectedOrganizer } = this.state;
    return organizers.filter((item) => item.uuid === selectedOrganizer)[0];
  }
  fetchData = () => {
    const { user } = this.context;
    this.setState({ status: 'Loading organizers...' });
    apiFetch('/api/organizer', {
      query: { owner: user.user_id },
    }).then((result) => {
      const organizers = result.instances;
      const selectedOrganizer = organizers.length ? organizers[0].uuid : 0;
      apiFetch(`/api/session?owner=${user.user_id}&OrganizerUuid=null`).then((sessionResult) => {
        const { instances, error } = sessionResult;
        this.setState({ selectedOrganizer, organizers, sessions: instances, status: error });
      });
    });
  }
  renderOrganizers() {
    const { sessions, organizers, status } = this.state;
    if (organizers) {
      if (organizers.length) {
        return <OrganizerView router={this.context.router} organizer={this.getOrganizer()} unassignedSessions={sessions} organizerList={organizers} onOrganizerChange={this.onOrganizerChange} />;
      }
      return (<SessionList sessions={sessions} />);
    }
    return (<LoadingMessage message={status} ellipsis />);
  }
  render() {
    return (<div>
      <Authenticated message="You must be logged on to view your profile">
        {this.renderOrganizers()}
      </Authenticated>
    </div>);
  }
}
