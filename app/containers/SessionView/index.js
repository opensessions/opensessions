import React from 'react';

import { Link } from 'react-router';

export default class SessionView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: React.PropTypes.object,
  }
  static propTypes = {
    params: React.PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.state = {
      session: null,
    };
  }
  componentDidMount() {
    const self = this;
    fetch(`/api/session/${this.props.params.uuid}`)
      .then((response) => response.json())
      .then((session) => self.setState({ session }));
  }
  renderActions() {
    const user = this.context ? this.context.user : false;
    const session = this.state.session || {};
    const actions = [];
    if (user && user.email === session.owner) {
      actions.push(<Link to={`/session/${session.uuid}/edit`}>Edit</Link>);
    }
    return (<div>
      {actions}
    </div>);
  }
  renderSession() {
    const session = this.state.session;
    if (!session) return null;
    return (<div>
      <h1>View session: {session.title}</h1>
      <p>Organizer: <Link to={session.href}>{session.organizer}</Link></p>
      <p>{session.description}</p>
    </div>);
  }
  render() {
    return (
      <div>
        {this.renderActions()}
        {this.renderSession()}
      </div>
    );
  }
}
