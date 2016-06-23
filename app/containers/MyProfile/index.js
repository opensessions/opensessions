import React from 'react';

import { Authenticated, LogoutLink } from 'react-stormpath';
import OrganizerView from '../OrganizerView';

import { apiFetch } from '../../utils/api';

export default class MyProfile extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: React.PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.state = {
      organizers: [],
    };
  }
  componentDidMount() {
    const self = this;
    const user = this.getUser();
    apiFetch('/api/organizer', {
      query: {
        owner: user.username,
      },
    }).then((organizers) => {
      self.setState({ organizers });
    });
  }
  getUser() {
    return this.context ? this.context.user : null;
  }
  renderOrganizers() {
    return (<ul>
      {this.state.organizers.map((organizer) => <li key={organizer.uuid}><OrganizerView organizer={organizer} /></li>)}
    </ul>);
  }
  render() {
    const user = this.getUser();
    return (
      <div>
        <Authenticated>
          <p>Hello, {user ? user.givenName : ''}, welcome to your profile!</p>
          <p>From here you can view your organizers and their sessions below, or (<LogoutLink>Log out</LogoutLink>)</p>
        </Authenticated>
        {this.renderOrganizers()}
      </div>
    );
  }
}
