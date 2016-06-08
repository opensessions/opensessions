/*
 * SessionForm
 */

import React from 'react';

import Header from 'components/Header';
import Fieldset from 'components/Fieldset';
import Form from 'components/Form';
import Field from 'components/Field';

import { Authenticated, NotAuthenticated, LoginLink } from 'react-stormpath';

export default class SessionForm extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <Header />
        <Authenticated>
          <h1>A session form!</h1>
          <Form>
            <Fieldset>
              <Field label="Activity" name="activity" />
              <Field label="Activity type" name="activity-type" />
            </Fieldset>
          </Form>
        </Authenticated>
        <NotAuthenticated>
          <p>You must <LoginLink>login</LoginLink> before you can add a session</p>
        </NotAuthenticated>
      </div>
    );
  }
}
