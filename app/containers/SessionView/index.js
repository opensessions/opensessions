/*
 * SessionView
 */

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
      session: {},
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
    return actions;
  }
  render() {
    const session = this.state.session || {};
    return (
      <div>
        {this.renderActions()}
        <h1>View session: {session.title}</h1>
        <p>Organizer: <Link to={`/profile/${session.owner}`}>{session.owner}</Link></p>
        <p>{session.description}</p>
      </div>
    );
  }
}
