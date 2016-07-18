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
    location: React.PropTypes.object,
    headerText: React.PropTypes.string
  };
  static contextTypes = {
    user: React.PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.state = {
      session: props.session || {},
      fieldsets: [
        { required: ['title', 'OrganizerUuid', 'description'], props: { validity: false } },
        { required: ['leader'], props: { validity: false } },
        { required: ['location'], props: { validity: false } },
        { required: ['price'], props: { validity: false } },
        { props: { validity: 'none' } },
        { props: { validity: 'none' } },
        { required: ['startDate', 'startTime'], props: { validity: false } }
      ]
    };
  }
  componentDidMount() {
    const self = this;
    let sessionUri = '/api/session/create';
    const options = {};
    if (this.props.session) {
      sessionUri = `/api/session/${this.props.session.uuid}`;
    } else if (this.props.sessionID) {
      sessionUri = `/api/session/${this.props.sessionID}`;
    } else {
      options.body = this.props.location.query;
    }
    apiFetch(sessionUri, options).then((res) => {
      self.onChange(res.instance);
      self.setState({ session: res.instance });
    });
  }
  onChange = (session) => {
    const { fieldsets } = this.state;
    let pendingSteps = 0;
    fieldsets.forEach((fieldset, key) => {
      let validity = 'none';
      if (fieldset.required) {
        validity = true;
        fieldset.required.forEach((field) => {
          if (!session[field]) {
            validity = false;
          }
        });
        if (!validity) pendingSteps += 1;
      }
      fieldsets[key].props.validity = validity;
    });
    this.setState({ fieldsets, pendingSteps });
  }
  onPublish = (session) => {
    if (session && session.state === 'published') {
      this.props.history.push(this.state.session.href);
    }
  }
  getSession() {
    let { session } = this.state;
    if (!session) session = {};
    session.update = this.updateSession;
    return session;
  }
  _locationInput = null
  updateSession = (name, value) => {
    const session = this.getSession();
    session[name] = value;
    this.setState({ session });
  }
  locationCallback = (place) => {
    const data = {
      formatted_address: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    this.updateSession('location', place.formatted_address);
    this.updateSession('locationData', JSON.stringify(data));
    return place.formatted_address;
  }
  renderDescriptionFieldset() {
    const session = this.getSession();
    const user = this.context.user || {};
    return (<Fieldset label="Description" ref="descriptionFieldset" {...this.state.fieldsets[0].props}>
      <Field label="Title" name="title" model={session} validation={{ maxLength: 50 }} tip="Enter a title for your session E.g. Volleyball training" />
      <Field label="Organizer" name="OrganizerUuid" model={session} type="Relation" relation={{ url: '/api/organizer', query: { owner: user.user_id } }} tip="Enter a club or session organiser name E.g. Richmond Rovers" />
      <Field label="Description" name="description" model={session} type="textarea" tip="Enter a description (detail on the activities you'll be doing)" />
      <Field label="Sport / activity type" name="activityType" model={session} tip="Enter the type of sport or activity E.g. Football, Yoga" />
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
                <h2>{this.props.headerText ? this.props.headerText : 'Add a session'}</h2>
                <h3>{session.title || <i>Untitled</i>}</h3>
              </div>
              <Link to={`/session/${session.uuid}`} className={styles.previewButton}>Preview</Link>
            </div>
          </div>
          <div className={styles.formBody}>
            <Form autosave model={session} onPublish={this.onPublish} onChange={this.onChange}>
              {this.renderDescriptionFieldset()}
              <Fieldset label="Additional info" {...this.state.fieldsets[1].props}>
                <Field label="What to bring" name="preparation" type="textarea" model={session} validation={{ maxLength: 2048 }} />
                <Field label="Session leader" name="leader" model={session} tip="Who will run the session?" />
                <Field label="Will participants receive coaching?" type="BoolRadio" name="hasCoaching" model={session} options={coachOptions} />
              </Fieldset>
              <Fieldset label="Location" {...this.state.fieldsets[2].props}>
                <Field type="Location" label="Location" name="location" model={session} onChange={this.locationCallback} value={session.location} defaultLocation={session.locationData ? JSON.parse(session.locationData) : null} tip="Type to search an address and select from the dropdown" />
                <Field label="Meeting point" name="meetingPoint" model={session} type="textarea" validation={{ maxLength: 50 }} />
              </Fieldset>
              <Fieldset label="Pricing" {...this.state.fieldsets[3].props}>
                <Field label="Attendance type" name="attendanceType" model={session} />
                <Field label="Price" name="price" model={session} type="number" validation={{ min: 0 }} />
                <Field label="Quantity" name="quantity" model={session} type="number" validation={{ min: 0 }} />
              </Fieldset>
              <Fieldset label="Restrictions" {...this.state.fieldsets[4].props}>
                <Field label="Gender Restrictions" type="IconRadio" name="genderRestriction" model={session} options={genderOptions} />
                <Field label="Is there a minimum age?" name="minAgeRestriction" model={session} type="OptionalNum" validation={{ min: 0 }} />
                <Field label="Is there a maximum age?" name="maxAgeRestriction" model={session} type="OptionalNum" validation={{ min: 0 }} />
              </Fieldset>
              <Fieldset label="Contact info" {...this.state.fieldsets[5].props}>
                <Field label="Phone" name="contactPhone" model={session} />
                <Field label="Email" name="contactEmail" model={session} type="email" />
              </Fieldset>
              {/* <Fieldset label="Photos">
                <Field label="Photo" name="photo" model={session} type="Image" />
              </Fieldset> */}
              <Fieldset label="Schedule" {...this.state.fieldsets[6].props}>
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
