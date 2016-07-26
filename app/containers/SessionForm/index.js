import React from 'react';

import Fieldset from 'components/Fieldset';
import Form from 'components/Form';
import Field from 'components/Field';
import NumField from 'components/NumField';
import TextField from 'components/TextField';
import GenderSvg from 'components/GenderSvg';

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
        { props: { validity: 'none' } },
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
          if ([null, ''].indexOf(session[field]) !== -1) {
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
  onAutosaveEvent = () => {
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
  renderDescriptionFieldset() {
    const session = this.getSession();
    const user = this.context.user || {};
    return (<Fieldset label="Description" ref="descriptionFieldset" {...this.state.fieldsets[0].props}>
      <Field label="Session title" name="title" model={session} validation={{ maxLength: 50 }} tip="Enter a title for your session" placeholder="E.g. Volleyball training" />
      <Field label="Organizer" name="OrganizerUuid" model={session} type="Relation" relation={{ url: '/api/organizer', query: { owner: user.user_id } }} tip="Group or organization running the session" />
      <Field label="Description" name="description" model={session} type="textarea" tip="Enter a description (detail on the activities you'll be doing)" />
      <Field label="Sport / activity type" name="activityType" model={session} tip="Enter the type of sport or activity E.g. Football, Yoga" placeholder="E.g. Volleyball" />
    </Fieldset>);
  }
  render() {
    const session = this.getSession();
    const genderOptions = [
      { text: 'None (Mixed)', value: 'mixed', icon: <GenderSvg /> },
      { text: 'Male only', value: 'male', icon: <GenderSvg only="male" /> },
      { text: 'Female only', value: 'female', icon: <GenderSvg only="female" /> }
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
              <Link to={`/session/${session.uuid}`} onClick={this.onPreview} className={styles.previewButton}>Preview</Link>
            </div>
          </div>
          <div className={styles.formBody}>
            <Form autosave model={session} autosaveEvent={this.onAutosaveEvent} onPublish={this.onPublish} onChange={this.onChange} pendingSteps={this.state.pendingSteps}>
              {this.renderDescriptionFieldset()}
              <Fieldset label="Additional info" {...this.state.fieldsets[1].props}>
                <Field label="What to bring" name="preparation" type="textarea" model={session} validation={{ maxLength: 2048 }} placeholder="Just bring yourself..." tip="Include any specialist equipment or clothing people will need to bring" />
                <Field label="Session leader" name="leader" model={session} tip="Who will run the session?" />
                <Field label="Will participants receive coaching?" type="BoolRadio" name="hasCoaching" model={session} options={coachOptions} />
              </Fieldset>
              <Fieldset label="Location" {...this.state.fieldsets[2].props}>
                <Field label="Address" type="Location" name="location" dataName="locationData" model={session} tip="Type to search an address and select from the dropdown" />
                <Field label="Meeting point" name="meetingPoint" model={session} type="Optional" component={{ type: TextField, props: { validation: { maxLength: 50 } } }} multiline no="None" yes="Add details" tip="If the meeting point is not obvious from the address, add details here" null="" />
              </Fieldset>
              <Fieldset label="Pricing" {...this.state.fieldsets[3].props}>
                {/* <Field label="Attendance type" name="attendanceType" model={session} /> */}
                <Field label="Price" name="price" model={session} type="Optional" component={{ type: NumField, props: { validation: { min: 0 }, format: '£ :', step: '0.25' } }} no="Free" yes="Paid" />
                <Field label="Quantity" name="quantity" model={session} type="number" validation={{ min: 0 }} tip="How many spaces are available?" />
              </Fieldset>
              <Fieldset label="Restrictions" {...this.state.fieldsets[4].props}>
                <Field label="Gender Restrictions" type="IconRadio" name="genderRestriction" model={session} options={genderOptions} />
                <Field label="Is there a minimum age?" name="minAgeRestriction" model={session} type="Optional" component={{ type: NumField, props: { validation: { min: 0 }, format: ': years old' } }} null="0" />
                <Field label="Is there a maximum age?" name="maxAgeRestriction" model={session} type="Optional" component={{ type: NumField, props: { validation: { min: 0 }, format: ': years old' } }} null="0" />
              </Fieldset>
              <Fieldset label="Contact info" {...this.state.fieldsets[5].props}>
                <Field label="Phone" name="contactPhone" model={session} />
                <Field label="Email" name="contactEmail" model={session} type="email" />
              </Fieldset>
              {/* <Fieldset label="Photos">
                <Field label="Photo" name="photo" model={session} type="Image" />
              </Fieldset> */}
              <Fieldset label="Schedule" {...this.state.fieldsets[6].props}>
                <Field label="Date" name="startDate" type="date" model={session} />
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
