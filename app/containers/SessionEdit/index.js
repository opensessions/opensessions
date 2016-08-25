import React, { PropTypes } from 'react';

import SessionForm from 'containers/SessionForm';

export default class SessionEdit extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    params: PropTypes.object,
  };
  static contextTypes = {
    router: PropTypes.object
  };
  static childContextTypes = {
    router: PropTypes.object
  }
  getChildContext() {
    return { router: this.context.router };
  }
  render() {
    return (
      <SessionForm headerText="Edit session" sessionID={this.props.params.uuid} {...this.props} />
    );
  }
}
