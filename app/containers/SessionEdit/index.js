import React, { PropTypes } from 'react';

import SessionForm from 'containers/SessionForm';

export default class SessionEdit extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    params: PropTypes.object,
  }
  render() {
    return <SessionForm headerText="Edit session" {...this.props} />;
  }
}
