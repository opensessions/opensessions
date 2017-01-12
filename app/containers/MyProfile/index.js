import React, { PropTypes } from 'react';

import OrganizerView from '../OrganizerView';

import Authenticated from '../../components/Authenticated';
import LoadingMessage from '../../components/LoadingMessage';
import SessionList from '../../containers/SessionList';

import { apiModel } from '../../utils/api';

export default class MyProfile extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    store: PropTypes.object,
    user: PropTypes.object,
    notify: PropTypes.func
  };
  static fetchData = (dispatch, user) => apiModel.search('organizer', { canAct: 'edit' }).then(result => {
    dispatch({ type: 'PROFILE_ORGANIZERS_LOADED', payload: result.instances });
    return apiModel.search('session', { owner: user.user_id, OrganizerUuid: 'null' }).then(sessionResult => {
      const { instances, error } = sessionResult;
      if (error) throw Error(error);
      dispatch({ type: 'PROFILE_SESSIONS_LOADED', payload: instances });
    });
  })
  constructor() {
    super();
    this.state = {};
  }
  componentDidMount() {
    if (this.context.user) {
      this.fetchDataClient();
    } else {
      setTimeout(() => {
        this.fetchDataClient();
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
    return (selectedOrganizer ? organizers.filter(item => item.uuid === selectedOrganizer) : organizers)[0];
  }
  fetchDataClient() {
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
  render() {
    return (<Authenticated message="You must be logged on to view your profile" button="Log in">
      {this.renderOrganizers()}
    </Authenticated>);
  }
}
