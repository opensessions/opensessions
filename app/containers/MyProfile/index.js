import React from 'react';

import OrganizerView from '../OrganizerView';
import LogoutLink from '../../components/LogoutLink';

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
    };
  }
  fetchOrganizers() {
    const self = this;
    const {user} = this.context;
    apiFetch('/api/organizer', {
      query: { owner: user.user_id, }
    }).then((organizers) => {
      self.setState({ organizers });
    });
  }
  componentDidMount() {
    this.fetchOrganizers();
  }
  renderOrganizers() {
    return (<ul>
      {this.state.organizers.map((organizer) => <li key={organizer.uuid}><OrganizerView organizer={organizer} /></li>)}
    </ul>);
  }
  render() {
    const {user} = this.context;
    console.log("user from profile", user);
    return (
      <div>
        <p>Hello, {user ? user.nickname: ''}!</p>
        <p>From here you can view your organizers and their sessions below, or (<LogoutLink value="Log out" />)</p>
        {this.renderOrganizers()}
      </div>
    );
  }
}
