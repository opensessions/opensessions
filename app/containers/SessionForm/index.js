import React from 'react';

import Fieldset from 'components/Fieldset';
import Form from 'components/Form';
import Field from 'components/Field';

import { Link } from 'react-router';
import Authenticated from 'components/Authenticated';

import styles from './styles.css';

import { apiFetch } from '../../utils/api';

export default class SessionForm extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    history: React.PropTypes.object,
    session: React.PropTypes.object,
    sessionID: React.PropTypes.string,
  };
  static contextTypes = {
    user: React.PropTypes.object,
  };
  constructor(props) {
    super(props);
    this.state = { session: props.session || {} };
    this.updateSession = this.updateSession.bind(this);
    this.locationCallback = this.locationCallback.bind(this);
    this.onPublish = this.onPublish.bind(this);
  }
  componentDidMount() {
    const self = this;
    let sessionUri = '/api/session/create';
    if (this.props.session) {
      sessionUri = `/api/session/${this.props.session.uuid}`;
    } else if (this.props.sessionID) {
      sessionUri = `/api/session/${this.props.sessionID}`;
    }
    apiFetch(sessionUri).then((res) => {
      self.setState({ session: res.instance });
    });
  }
  onPublish(session) {
    if (session && session.state === 'published') {
      this.props.history.push(this.state.session.href);
    }
  }
  getSession() {
    const session = this.state.session || {};
    session.update = this.updateSession;
    return session;
  }
  _locationInput = null
  updateSession(name, value) {
    const session = this.getSession();
    session[name] = value;
    this.setState({ session });
  }
  locationCallback(autocomplete) {
    const place = autocomplete.getPlace();
    const data = {
      formatted_address: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    this.updateSession('location', place.formatted_address);
    this.updateSession('locationData', JSON.stringify(data));
    return place;
  }
  renderDescriptionFieldset() {
    const session = this.getSession();
    const user = this.context.user || {};
    return (<Fieldset label="Description" ref="descriptionFieldset">
      <Field label="Title" name="title" model={session} validation={{ maxLength: 50 }} tip="Enter a title for your session E.g. Volleyball training" />
      <Field label="Organizer" name="OrganizerUuid" model={session} type="Relation" relationURL="/api/organizer" relationQuery={{ owner: user.user_id }} tip="Enter a club or session organiser name E.g. Richmond Rovers" />
      <Field label="Description" name="description" model={session} type="textarea" />
      <Field label="Sport / activity type" name="activityType" model={session} />
    </Fieldset>);
  }
  render() {
    const session = this.getSession();
    const genderOptions = [
      { text: 'None (Mixed)', value: 'mixed', src: '/images/mixed.svg', selectedSrc: '/images/mixed-selected.svg' },
      { text: 'Male only', value: 'male', src: '/images/male.svg', selectedSrc: '/images/male-selected.svg' },
      { text: 'Female only', value: 'female', src: '/images/female.svg', selectedSrc: '/images/female-selected.svg' }
    ];
    const coachOptions = [
      { text: 'Uncoached' },
      { text: 'Coached' }
    ];
    return (
      <div className={styles.form}>
        <Authenticated message="You must login before you can add a session">
          <div className={styles.titleBar}>
            <div className={styles.titleInner}>
              <div>
                <h2>Add a session</h2>
                <h3>{session.title || <i>Untitled</i>}</h3>
              </div>
              <Link to={`/session/${session.uuid}`} className={styles.previewButton}>Preview</Link>
            </div>
          </div>
          <div className={styles.formBody}>
            <Form autosave model={session} onPublish={this.onPublish}>
              {this.renderDescriptionFieldset()}
              <Fieldset label="Additional info">
                <Field label="What to bring" name="preparation" type="textarea" model={session} validation={{ maxLength: 2048 }} />
                <Field label="Session leader" name="leader" model={session} />
                <Field label="Will participants receive coaching?" type="BoolRadio" name="hasCoaching" model={session} options={coachOptions} />
              </Fieldset>
              <Fieldset label="Location">
                <Field type="Location" label="Location" name="location" model={session} onChange={this.locationCallback} value={session.location} defaultLocation={session.locationData ? JSON.parse(session.locationData) : null} />
                <Field label="Meeting point" name="meetingPoint" model={session} type="textarea" validation={{ maxLength: 50 }} />
              </Fieldset>
              <Fieldset label="Pricing">
                <Field label="Attendance type" name="attendanceType" model={session} />
                <Field label="Price" name="price" model={session} type="number" validation={{ min: 0 }} />
                <Field label="Quantity" name="quantity" model={session} type="number" validation={{ min: 0 }} />
              </Fieldset>
              <Fieldset label="Restrictions">
                <Field label="Gender Restrictions" type="IconRadio" name="genderRestriction" model={session} options={genderOptions} />
                <Field label="Is there a minimum age?" name="minAgeRestriction" model={session} type="OptionalNum" validation={{ min: 0 }} />
                <Field label="Is there a maximum age?" name="maxAgeRestriction" model={session} type="OptionalNum" validation={{ min: 0 }} />
              </Fieldset>
              <Fieldset label="Contact info">
                <Field label="Phone" name="contactPhone" model={session} />
                <Field label="Email" name="contactEmail" model={session} type="email" />
              </Fieldset>
              {/* <Fieldset label="Photos">
                <Field label="Example" name="example" model={session} />
              </Fieldset> */}
              <Fieldset label="Schedule">
                <Field label="Start date" name="startDate" type="date" model={session} />
                <Field label="Start time" name="startTime" type="time" model={session} />
                <Field label="End time" name="endTime" type="time" model={session} />
              </Fieldset>
            </Form>
          </div>
        </Authenticated>
      </div>
    );
  }
}
