import React, { PropTypes } from 'react';

import OrganizerView from '../OrganizerView';

import Authenticated from 'components/Authenticated';
import NotificationBar from 'components/NotificationBar';
import LoadingMessage from 'components/LoadingMessage';
import SessionList from 'containers/SessionList';

import { apiModel } from '../../utils/api';

export default class MyProfile extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: PropTypes.object,
    lock: PropTypes.object,
    router: PropTypes.object,
    notifications: PropTypes.array,
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
  onOrganizerChange = event => {
    const { value } = event.target;
    this.setState({ selectedOrganizer: value });
  }
  getOrganizer() {
    const { organizers, selectedOrganizer } = this.state;
    return organizers.filter(item => item.uuid === selectedOrganizer)[0];
  }
  fetchData = () => {
    const { user } = this.context;
    this.setState({ status: 'Loading organizers...' });
    return apiModel.search('organizer', { owner: user.user_id }).then(result => {
      const organizers = result.instances;
      const selectedOrganizer = organizers.length ? organizers[0].uuid : 0;
      return apiModel.search('session', { owner: user.user_id, OrganizerUuid: 'null' }).then(sessionResult => {
        const { instances, error } = sessionResult;
        this.setState({ selectedOrganizer, organizers, sessions: instances, status: error });
      });
    });
  }
  renderOrganizers() {
    const { sessions, organizers, status } = this.state;
    if (organizers) {
      if (organizers.length) {
        return <OrganizerView organizer={this.getOrganizer()} unassignedSessions={sessions} organizerList={organizers} onOrganizerChange={this.onOrganizerChange} />;
      }
      return (<SessionList sessions={sessions} />);
    }
    return (<LoadingMessage message={status} ellipsis />);
  }
  render() {
    return (<div>
      <NotificationBar notifications={this.context.notifications} zIndex={4} />
      <Authenticated message="You must be logged on to view your profile" button="Log in">
        {this.renderOrganizers()}
      </Authenticated>
    </div>);
  }
}
