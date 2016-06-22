import React from 'react';
import { Link } from 'react-router';

export default class ProfileView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    user: React.PropTypes.object,
    params: React.PropTypes.object,
  }
  static contextTypes = {
    user: React.PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.state = {
      sessions: [],
      user: props.user || null,
    };
  }
  componentDidMount() {
    const self = this;
    if (!this.state.user) {
      this.apiFetch(`/api/profile/${this.props.params.id}`).then((user) => {
        self.setState({ user });
      });
    }
    let userId;
    if (this.props.params && this.props.params.id) {
      userId = this.props.params.id;
    } else {
      userId = this.state.user.href.split('/').pop();
    }
    this.apiFetch(`/api/profile/${userId}/sessions`).then((sessions) => {
      self.setState({ sessions });
    });
  }
  apiFetch(url) {
    return fetch(url, {
      mode: 'cors',
      credentials: 'same-origin',
    }).then((response) => response.json());
  }
  renderSessions() {
    return (<ol>
      {this.state.sessions.map((session) => (<li><Link to={`/session/${session.uuid}`}>{session.title || `Untitled (${session.updatedAt})`}</Link></li>))}
    </ol>);
  }
  render() {
    const user = this.state.user || this.context.user;
    return (
      <div>
        {user.givenName}
        {this.renderSessions()}
      </div>
    );
  }
}
