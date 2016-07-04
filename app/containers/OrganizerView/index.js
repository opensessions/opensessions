import React from 'react';
import { Link } from 'react-router';

import { apiFetch } from '../../utils/api';

export default class OrganizerView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    organizer: React.PropTypes.object,
    params: React.PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.state = {
      organizer: props.organizer || null,
    };
  }
  componentDidMount() {
    const self = this;
    let uuid;
    if (this.props.params && this.props.params.uuid) {
      uuid = this.props.params.uuid;
      apiFetch(`/api/organizer/${uuid}`).then((organizer) => {
        self.setState({ organizer });
      });
    }
  }
  renderSessions() {
    const organizer = this.state.organizer;
    if (!organizer) return null;
    return (<ol>
      {organizer.Sessions.map((session) => (<li key={session.uuid}><Link to={session.href}>{session.displayName}</Link></li>))}
    </ol>);
  }
  renderOrganizer() {
    const organizer = this.state.organizer;
    if (!organizer) return null;
    return (<div>
      <h1>Organizer: <Link to={organizer.href}>{organizer.name}</Link></h1>
    </div>);
  }
  render() {
    return (
      <div>
        {this.renderOrganizer()}
        {this.renderSessions()}
      </div>
    );
  }
}
