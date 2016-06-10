/*
 * SessionForm
 */

import React from 'react';

import Fieldset from 'components/Fieldset';
import Form from 'components/Form';
import Field from 'components/Field';

import { Authenticated, NotAuthenticated, LoginLink } from 'react-stormpath';

export default class SessionForm extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <Authenticated>
          <h1>A session form!</h1>
          <Form>
            <Fieldset label="Description">
              <Field label="Title" name="title" />
              <Field label="Organizer" name="organizer" />
              <Field label="Description" name="description" type="textarea" />
              <Field label="Activity type" name="activity-type" />
            </Fieldset>
            <Fieldset label="Additional info">
            </Fieldset>
            <Fieldset label="Location">
            </Fieldset>
            <Fieldset label="Pricing">
            </Fieldset>
            <Fieldset label="Restrictions">
            </Fieldset>
            <Fieldset label="Contact info">
            </Fieldset>
            <Fieldset label="Photos">
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
