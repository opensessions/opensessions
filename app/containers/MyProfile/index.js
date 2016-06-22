import React from 'react';

import { Authenticated, LogoutLink } from 'react-stormpath';
import OrganizerView from '../OrganizerView';

export default class MyProfile extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: React.PropTypes.object,
  }
  render() {
    const user = this.context ? this.context.user : null;
    return (
      <div>
        <Authenticated>
          <p>Hello, {user ? user.givenName : ''}! (<LogoutLink>Log out</LogoutLink>)</p>
        </Authenticated>
        <OrganizerView user={user} />
      </div>
    );
  }
}
