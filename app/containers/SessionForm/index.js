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
  static propTypes = {
    session: React.PropTypes.object,
  }
  constructor(props) {
    super();
    this.state = { session: props.session || {} };
    this.updateSession = this.updateSession.bind(this);
  }
  componentDidMount() {
    const self = this;
    if (!this.props.session) {
      fetch('/api/session/example').then((response) => response.json()).then((session) => {
        self.setState({ session });
      });
    }
  }
  updateSession(name, value) {
    const session = this.state.session;
    session[name] = value;
    this.setState({ session });
  }
  render() {
    const session = this.state.session || {};
    session.update = this.updateSession;
    return (
      <div className={styles.form}>
        <Authenticated>
          <div className={styles.titleBar}>
            <div className={styles.titleInner}>
              <div>
                <h2>Add a session</h2>
                <h3>{session.title}</h3>
              </div>
              <Link to="/session/view/ExampleSessionID" className={styles.previewButton}>Preview</Link>
            </div>
          </div>
          <div className={styles.formBody}>
            <Form autosave model={session}>
              <Fieldset label="Description">
                <Field label="Title" name="title" model={session} tip="Enter a title for your session E.g. Volleyball training" />
                <Field label="Organizer" name="organizer" model={session} />
                <Field label="Description" name="description" model={session} type="textarea" />
                <Field label="Sport / activity type" name="activityType" model={session} />
                <Field label="Sub category" name="activitySubType" model={session} />
              </Fieldset>
              <Fieldset label="Additional info" />
              <Fieldset label="Location" />
              <Fieldset label="Pricing" />
              <Fieldset label="Restrictions" />
              <Fieldset label="Contact info" />
              <Fieldset label="Photos" />
            </Form>
          </div>
        </Authenticated>
        <NotAuthenticated>
          <p>You must <LoginLink>login</LoginLink> before you can add a session</p>
        </NotAuthenticated>
      </div>
    );
  }
}
