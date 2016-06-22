import React from 'react';
import { Link } from 'react-router';

export default class OrganizerView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    organizer: React.PropTypes.object,
    params: React.PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.state = {
      organizer: props.organizer || { href: '' },
      sessions: [],
    };
  }
  componentDidMount() {
    const self = this;
    let uuid;
    if (this.props.params && this.props.params.uuid) {
      uuid = this.props.params.uuid;
    } else {
      uuid = this.state.organizer.uuid;
    }
    this.apiFetch(`/api/organizer/${uuid}/sessions`).then((data) => {
      self.setState(data);
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
      {this.state.sessions.map((session) => (<li><Link to={session.href}>{session.title || `Untitled (${session.updatedAt})`}</Link></li>))}
    </ol>);
  }
  render() {
    const organizer = this.state.organizer;
    return (
      <div>
        <h1>Organizer: <Link to={organizer.href}>{organizer.name}</Link></h1>
        {this.renderSessions()}
      </div>
    );
  }
}
