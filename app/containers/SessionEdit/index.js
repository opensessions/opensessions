/*
 * SessionForm
 */

import React from 'react';

import SessionForm from 'containers/SessionForm';

export default class SessionEdit extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    params: React.PropTypes.object,
  }
  render() {
    return (
      <SessionForm sessionID={this.props.params.uuid} />
    );
  }
}
