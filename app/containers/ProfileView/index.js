/*
 * HomePage
 */

import React from 'react';
import { Link } from 'react-router';

import { Authenticated, LogoutLink } from 'react-stormpath';

export default class ProfileView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: React.PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.state = {
      sessions: [],
    };
  }
  componentDidMount() {
    const self = this;
    fetch('/api/me/sessions', {
      mode: 'cors',
      credentials: 'same-origin',
    }).then((response) => response.json()).then((sessions) => {
      self.setState({ sessions });
    });
  }
  renderSessions() {
    return (<ol>
      {this.state.sessions.map((session) => (<li><Link to={`/session/${session.uuid}`}>{session.title || `Untitled (${session.updatedAt})`}</Link></li>))}
    </ol>);
  }
  render() {
    const user = this.context ? this.context.user : null;
    return (
      <div>
        <Authenticated>
          <p>Hello, {user ? user.givenName : ''}!</p>
          {this.renderSessions()}
          <p><LogoutLink>Log out</LogoutLink></p>
        </Authenticated>
      </div>
    );
  }
}
