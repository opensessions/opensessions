import React from 'react';

import Authenticated from 'components/Authenticated';

export default class ForgotPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <Authenticated message="Send an email">
          <p>You are already logged in!</p>
        </Authenticated>
      </div>
    );
  }
}
