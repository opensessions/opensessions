/*
 * SessionView
 */

import React from 'react';

// import { Link } from 'react-router';

export default class SessionView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    params: React.PropTypes.object,
  }
  componentDidMount() {
    fetch('/api/session/' + this.props.params.sessionID).then((result) => {
      console.log(result);
    });
  }
  render() {
    return (
      <div>
        <h1>View session: title</h1>
        <p>Info etc</p>
      </div>
    );
  }
}
