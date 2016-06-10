/*
 * SessionView
 */

import React from 'react';

// import { Link } from 'react-router';

export default class SessionView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    params: React.PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.state = {
      session: {
        title: '',
        description: '',
      },
    };
  }
  componentDidMount() {
    const self = this;
    fetch(`/api/session/${this.props.params.sessionID}`).then(
      (response) => response.json()
    ).then(
      (session) => self.setState({ session })
    );
  }
  render() {
    const session = this.state.session || {};
    return (
      <div>
        <h1>View session: {session.title}</h1>
        <p>{session.description}</p>
      </div>
    );
  }
}
