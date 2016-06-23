import React from 'react';

import { Authenticated, LogoutLink } from 'react-stormpath';
import OrganizerView from '../OrganizerView';

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
    this.apiFetch('/api/organizer', {
      owner: user.username,
    }).then((organizers) => {
      self.setState({ organizers });
    });
  }
  getUser() {
    return this.context ? this.context.user : null;
  }
  apiFetch(url, query) {
    const opts = {};
    opts.mode = 'cors';
    opts.credentials = 'same-origin';
    if (query) {
      url += '?';
      url += Object.keys(query)
       .map((key) => [encodeURIComponent(key), encodeURIComponent(query[key])].join('='))
       .join('&')
       .replace(/%20/g, '+');
    }
    return fetch(url, opts).then((response) => response.json());
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
