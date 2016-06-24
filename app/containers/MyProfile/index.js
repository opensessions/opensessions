import React from 'react';

import OrganizerView from '../OrganizerView';
import LogoutLink from '../../components/LogoutLink';

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
    const {user} = this.context;
    this.apiFetch('/api/organizer', {
      owner: user.email,
    }).then((organizers) => {
      self.setState({ organizers });
    });
  }
  static contextTypes = {
    user: React.PropTypes.object,
    lock: React.PropTypes.object,
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
    return (this.state.organizers.map((organizer) => <OrganizerView organizer={organizer} />));
  }
  render() {
    const {user} = this.context;
    console.log("user from profile", user);
    return (
      <div>
        <p>Hello, {user ? user.nickname: ''}! (<LogoutLink user={user} value="Log out" />)</p>
        {this.renderOrganizers()}
      </div>
    );
  }
}
