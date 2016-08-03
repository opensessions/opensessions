import React from 'react';

import Fieldset from 'components/Fieldset';
import Form from 'components/Form';
import Field from 'components/Field';
import NumField from 'components/NumField';
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
      autosaveState: 'none',
      fieldsets: [
        { required: ['title', 'OrganizerUuid', 'description'], props: { heading: 'Session Info', validity: false, title: 'Add details about your session', subtitle: 'You\'ll be able to edit these details later' } },
        { required: ['leader'], props: { validity: false, title: 'Add details about your session', subtitle: 'You\'ll be able to edit these details later' } },
        { required: ['location'], props: { validity: false, title: 'Where is your session happening?', subtitle: 'Select a location and let participants know about any meeting instructions' } },
        { props: { validity: 'none' } },
        { props: { validity: 'none', title: 'Who is your session for?', subtitle: 'Specify any gender or age restrictions that apply' } },
        { props: { validity: 'none' } },
        { required: ['startDate', 'startTime'], props: { heading: 'Scheduling', validity: false } }
      ]
    };
  }
  componentDidMount() {
    this.fetchData();
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
  onAutosaveEvent = (event) => {
    this.setState({ autosaveState: event.type });
  }
  getSession() {
    let { session } = this.state;
    if (!session) session = {};
    session.update = this.updateSession;
    return session;
  }
  fetchData = () => {
    let sessionUri = '/api/session/create';
    const { session, sessionID, location } = this.props;
    const options = {};
    if (session) {
      sessionUri = `/api/session/${session.uuid}`;
    } else if (sessionID) {
      sessionUri = `/api/session/${sessionID}`;
    } else {
      options.body = location.query;
    }
    apiFetch(sessionUri, options).then((res) => {
      this.onChange(res.instance);
      this.setState({ session: res.instance });
    });
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
      <Field label="Session Title" name="title" model={session} validation={{ maxLength: 50 }} tip="Enter a title for your session" example="E.g. Volleyball training" />
      <Field label="Organiser Name" name="OrganizerUuid" model={session} type="Relation" relation={{ url: '/api/organizer', query: { owner: user.user_id } }} tip="Enter the name of your club or organisation. If you don't represent a club or organisation, enter your own name" example="E.g. Richmond Volleyball" />
      <Field label="Session Description" name="description" model={session} type="textarea" tip="Let people know what's great about the session! Remember: the more detail you provide, the more likely people are to decide to attend." example="Tips: Who is this session for? What benefits will people get from it? What will the session be like? What will we do? Is any prior experience needed?" />
      <Field label="Sport or activity type" name="activityType" model={session} tip="Enter the type of activity or sport on offer for this session. If multiple activities are on offer at this session, please write 'Multiple Activities'" placeholder="E.g. Volleyball" example="E.g. Volleyball" />
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
      { text: 'No, the session is unlead' },
      { text: 'Yes, the session is coached' }
    ];
    return (<div className={styles.form}>
      <Authenticated message="You must login before you can add a session">
        <div className={styles.titleBar}>
          <div className={styles.titleInner}>
            <div>
              <h2>{this.props.headerText ? this.props.headerText : 'Add a session'}</h2>
              <h3>{session.title || <i>Untitled</i>}</h3>
            </div>
            <Link to={`/session/${session.uuid}`} className={`${styles.previewButton} ${this.state.autosaveState === 'pending' ? styles.disabled : ''}`}>{session.state === 'published' ? 'View' : 'Preview'}</Link>
          </div>
        </div>
        <div className={styles.formBody}>
          <Form autosave={session.state !== 'published'} model={session} autosaveEvent={this.onAutosaveEvent} onPublish={this.onPublish} onChange={this.onChange} pendingSteps={this.state.pendingSteps}>
            {this.renderDescriptionFieldset()}
            <Fieldset label="Additional info" {...this.state.fieldsets[1].props}>
              <Field label="Is there anything participants should bring?" tipTitle="What to bring" name="preparation" type="textarea" validation={{ maxLength: 500 }} model={session} placeholder="Sensible running shoes that you don't mind ruining with sand" tip="Let participants know how to prepare for your session. Is there anything they will need to bring?" />
              <Field label="Who is the leader for this session?" tipTitle="Session Leader" name="leader" model={session} type="text" tip="Enter the name of the person who will be leading the session. It's helpful for participants to know who's in charge when they arrive" example="E.g. John Smith" />
              <Field label="Will participants receive coaching?" type="BoolRadio" name="hasCoaching" model={session} options={coachOptions} />
            </Fieldset>
            <Fieldset label="Location" {...this.state.fieldsets[2].props}>
              <Field label="Address" type="Location" name="location" dataName="locationData" model={session} tip="Type to search an address and select from the dropdown" />
              <Field label="Meeting Instructions" name="meetingPoint" model={session} type="textarea" validation={{ maxLength: 50 }} tip="What should participants do when they arrive at the venue or location? Try to be as specific as possible." example="E.g. Meet in the main reception area" />
            </Fieldset>
            <Fieldset label="Pricing" {...this.state.fieldsets[3].props}>
              {/* <Field label="Attendance type" name="attendanceType" model={session} /> */}
              <Field label="Price" name="price" model={session} type="Optional" component={{ type: NumField, props: { validation: { min: 0 }, format: '£ :', step: '0.25' } }} no="Free" yes="Paid" />
              <Field label="Quantity" name="quantity" model={session} type="number" validation={{ min: 0 }} tip="How many spaces are available?" />
            </Fieldset>
            <Fieldset label="Restrictions" {...this.state.fieldsets[4].props}>
              <Field label="Gender restrictions" type="IconRadio" name="genderRestriction" model={session} options={genderOptions} />
              <Field label="Is there a minimum age?" name="minAgeRestriction" model={session} type="Optional" component={{ type: NumField, props: { validation: { min: 0 }, format: ': years old' } }} null="0" />
              <Field label="Is there a maximum age?" name="maxAgeRestriction" model={session} type="Optional" component={{ type: NumField, props: { validation: { min: 0 }, format: ': years old' } }} null="0" />
            </Fieldset>
            <Fieldset label="Contact info" {...this.state.fieldsets[5].props}>
              <Field label="Phone number" name="contactPhone" model={session} />
              <Field label="Email address" name="contactEmail" model={session} type="email" />
            </Fieldset>
            {/* <Fieldset label="Photos">
              <Field label="Photo" name="photo" model={session} type="Image" />
            </Fieldset> */}
            <Fieldset label="Add a schedule" {...this.state.fieldsets[6].props}>
              <Field label="Date" name="startDate" type="date" model={session} />
              <Field label="Start time" name="startTime" type="time" model={session} />
              <Field label="End time" name="endTime" type="time" model={session} />
            </Fieldset>
          </Form>
        </div>
      </Authenticated>
    </div>);
  }
}
