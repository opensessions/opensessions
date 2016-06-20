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
    super(props);
    this.state = { session: props.session || {} };
    this.updateSession = this.updateSession.bind(this);
  }
  componentDidMount() {
    const self = this;
    let sessionUri = '/api/session/create';
    if (this.props.session) {
      sessionUri = `/api/session/${this.props.session.uuid}`;
    }
    fetch(sessionUri, {
      mode: 'cors',
      credentials: 'same-origin',
    }).then((response) => response.json()).then((session) => {
      self.setState({ session });
    });
  }
  getSession() {
    const session = this.state.session || {};
    session.update = this.updateSession;
    return session;
  }
  updateSession(name, value) {
    const session = this.getSession();
    session[name] = value;
    this.setState({ session });
  }
  renderDescriptionFieldset() {
    const session = this.getSession();
    return (<Fieldset label="Description" ref="descriptionFieldset">
      <Field label="Title" name="title" model={session} validation={{ maxLength: 50 }} tip="Enter a title for your session E.g. Volleyball training" />
      <Field label="Organizer" name="organizer" model={session} />
      <Field label="Description" name="description" model={session} type="textarea" />
      <Field label="Sport / activity type" name="activityType" model={session} />
      <Field label="Sub category" name="activitySubType" model={session} />
    </Fieldset>);
  }
  render() {
    const session = this.getSession();
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
              {this.renderDescriptionFieldset()}
              <Fieldset label="Additional info">
                <Field label="Example" name="example" />
              </Fieldset>
              <Fieldset label="Location">
                <Field label="Example" name="example" />
              </Fieldset>
              <Fieldset label="Pricing">
                <Field label="Example" name="example" />
              </Fieldset>
              <Fieldset label="Restrictions">
                <Field label="Example" name="example" />
              </Fieldset>
              <Fieldset label="Contact info">
                <Field label="Example" name="example" />
              </Fieldset>
              <Fieldset label="Photos">
                <Field label="Example" name="example" />
              </Fieldset>
              <Fieldset label="Schedule">
                <Field label="Start date" name="startDate" type="date" model={session} />
                <Field label="Start time" name="startTime" type="time" model={session} />
                <Field label="End time" name="endTime" type="time" model={session} />
              </Fieldset>
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
