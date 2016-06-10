/*
 * SessionForm
 */

import React from 'react';

import Fieldset from 'components/Fieldset';
import Form from 'components/Form';
import Field from 'components/Field';

import { Link } from 'react-router';
import { Authenticated, NotAuthenticated, LoginLink } from 'react-stormpath';

import styles from './styles.css';

export default class SessionForm extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div className={styles.form}>
        <div>
          <h2>Add a session</h2>
          <h3>Title</h3>
          <Link to="/session/view/ExampleSessionID" className={styles.previewButton}>Preview</Link>
        </div>
        <Authenticated>
          <h1>A session form!</h1>
          <Form autosave="true">
            <Fieldset label="Description">
              <Field label="Title" name="title" />
              <Field label="Organizer" name="organizer" />
              <Field label="Description" name="description" type="textarea" />
              <Field label="Activity type" name="activity-type" />
            </Fieldset>
            <Fieldset label="Additional info" />
            <Fieldset label="Location" />
            <Fieldset label="Pricing" />
            <Fieldset label="Restrictions" />
            <Fieldset label="Contact info" />
            <Fieldset label="Photos" />
          </Form>
        </Authenticated>
        <NotAuthenticated>
          <p>You must <LoginLink>login</LoginLink> before you can add a session</p>
        </NotAuthenticated>
      </div>
    );
  }
}
