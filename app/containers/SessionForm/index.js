import React, { PropTypes } from 'react';

import Fieldset from 'components/Fieldset';
import Form from 'components/Form';
import Field from 'components/Field';
import NumField from 'components/NumField';
import GenderSvg from 'components/GenderSvg';
import Sticky from 'components/Sticky';

import { Link } from 'react-router';
import Authenticated from 'components/Authenticated';

import styles from './styles.css';

import { apiModel } from '../../utils/api';

export default class SessionForm extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    history: PropTypes.object,
    session: PropTypes.object,
    sessionID: PropTypes.string,
    location: PropTypes.object,
    headerText: PropTypes.string
  };
  static contextTypes = {
    user: PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.state = {
      session: props.session || {},
      autosaveState: 'none',
      fieldsets: [
        { renderer: this.renderDescriptionFieldset, slug: 'description', required: ['title', 'OrganizerUuid', 'description'], props: { label: 'Description', heading: 'Session Info', validity: false, title: 'Add details about your session', subtitle: 'You\'ll be able to edit these details later' } },
        { renderer: this.renderAdditionalFieldset, slug: 'additional', required: ['leader'], props: { label: 'Additional info', validity: false, title: 'Add details about your session', subtitle: 'You\'ll be able to edit these details later' } },
        { renderer: this.renderLocationFieldset, slug: 'location', required: ['location'], props: { label: 'Location', validity: false, title: 'Where is your session happening?', subtitle: 'Select a location and let participants know about any meeting instructions' } },
        { renderer: this.renderPricingFieldset, slug: 'pricing', props: { label: 'Pricing', validity: 'none' } },
        { renderer: this.renderRestrictionsFieldset, slug: 'restrictions', props: { label: 'Who it\'s for', validity: 'none', title: 'Who is your session for?', subtitle: 'Specify any restrictions that apply and disabilities catered for' } },
        { renderer: this.renderContactFieldset, slug: 'contact', props: { label: 'Contact info', validity: 'none', title: 'Who can people talk to about this session?', subtitle: 'Help potential attendees by providing details of who they can contact' } },
        { renderer: this.renderScheduleFieldset, slug: 'schedule', required: ['startDate', 'startTime'], props: { label: 'Add a schedule', heading: 'Scheduling', validity: false } }
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
    const { session, sessionID, location, history } = this.props;
    const uuid = session ? session.uuid : (sessionID || null);
    if (uuid) {
      apiModel.get('session', uuid).then((res) => {
        this.onChange(res.instance);
        this.setState({ session: res.instance });
      });
    } else {
      apiModel.new('session', location.query).then((res) => {
        history.push(`${res.instance.href}/edit`);
      });
    }
  }
  _locationInput = null
  updateSession = (name, value) => {
    const session = this.getSession();
    session[name] = value;
    this.setState({ session });
  }
  addEmail = (email) => {
    this.setState({ customEmails: [{ uuid: email, name: email }] });
    this.updateSession('contactEmail', email);
  }
  renderFieldsets() {
    let key = 0;
    return this.state.fieldsets.map(fieldset => <Fieldset key={++key} {...fieldset.props}>{fieldset.renderer()}</Fieldset>);
  }
  renderDescriptionFieldset = () => {
    const session = this.getSession();
    const user = this.context.user || {};
    return (<div>
      <Field label="Session Title" name="title" model={session} validation={{ maxLength: 50 }} tip="Enter a title for your session" example="E.g. Volleyball training" />
      <Field label="Organiser Name" name="OrganizerUuid" model={session} type="Relation" props={{ relation: { model: 'organizer', query: { owner: user.user_id } } }} tip="Enter the name of your club or organisation. If you don't represent a club or organisation, enter your own name" example="E.g. Richmond Volleyball" />
      <Field label="Session Description" name="description" model={session} type="textarea" tip="Let people know what's great about the session! Remember: the more detail you provide, the more likely people are to decide to attend." example="Tips: Who is this session for? What benefits will people get from it? What will the session be like? What will we do? Is any prior experience needed?" props={{ size: 'XL' }} />
      <Field label="Sport or activity type" name="activityType" model={session} tip="Enter the type of activity or sport on offer for this session. If multiple activities are on offer at this session, please write 'Multiple Activities'" placeholder="E.g. Volleyball" example="E.g. Volleyball" />
    </div>);
  }
  renderAdditionalFieldset = () => {
    const session = this.getSession();
    const coachOptions = [
      { text: 'No, the session is unlead' },
      { text: 'Yes, the session is coached' }
    ];
    return (<div>
      <Field label="Is there anything participants should bring?" tipTitle="What to bring" name="preparation" type="textarea" validation={{ maxLength: 500 }} model={session} tip="Let participants know how to prepare for your session. Is there anything they will need to bring?" />
      <Field label="Who is the leader for this session?" tipTitle="Session Leader" name="leader" model={session} type="text" tip="Enter the name of the person who will be leading the session. It's helpful for participants to know who's in charge when they arrive" example="E.g. John Smith" />
      <Field label="Will participants receive coaching?" type="BoolRadio" name="hasCoaching" model={session} props={{ options: coachOptions }} />
      <Field label="Image" type="ImageUpload" name="image" model={session} props={{ uploadURL: `/api/session-image/${session.uuid}`, value: session.imageURL }} />
    </div>);
  }
  renderLocationFieldset = () => {
    const session = this.getSession();
    return (<div>
      <Field label="Address" type="Location" name="location" dataName="locationData" model={session} tip="Type to search an address and select from the dropdown" />
      <Field label="Meeting Instructions" name="meetingPoint" model={session} type="textarea" validation={{ maxLength: 50 }} tip="What should participants do when they arrive at the venue or location? Try to be as specific as possible." example="E.g. Meet in the main reception area" />
    </div>);
  }
  renderPricingFieldset = () => {
    const session = this.getSession();
    return (<div>
      <Field label="Price" name="price" model={session} type="Optional" props={{ no: 'Free', yes: 'Paid', component: { type: NumField, props: { validation: { min: 0 }, format: '£ :', step: '0.25' } } }} />
      <Field label="Quantity" name="quantity" model={session} type="number" validation={{ min: 0 }} tip="How many spaces are available?" />
    </div>);
  }
  renderRestrictionsFieldset = () => {
    const session = this.getSession();
    const genderOptions = [
      { text: 'None (Mixed)', value: 'mixed', icon: <GenderSvg /> },
      { text: 'Male only', value: 'male', icon: <GenderSvg only="male" /> },
      { text: 'Female only', value: 'female', icon: <GenderSvg only="female" /> }
    ];
    const disabilities = ['Learning disability', 'Mental health condition', 'Physical impairment', 'Visual impairment', 'Deaf', 'Please ask for more info'];
    return (<div>
      <Field label="Gender restrictions" type="IconRadio" name="genderRestriction" model={session} props={{ options: genderOptions }} tipTitle="Gender restrictions" tip="Select 'none' if there are no restrictions on gender" />
      <Field label="Is there a minimum age?" name="minAgeRestriction" model={session} type="Optional" props={{ component: { type: NumField, props: { validation: { min: 0, max: session.maxAgeRestriction || 120 }, format: ': years old' } }, null: '0' }} tipTitle="Minimum age" tip="If there is a minimum age, select 'yes' then enter the age" />
      <Field label="Is there a maximum age?" name="maxAgeRestriction" model={session} type="Optional" props={{ component: { type: NumField, props: { validation: { min: session.minAgeRestriction || 0, max: 120 }, format: ': years old' } }, null: '0' }} tipTitle="Maximum age" tip="If there is a maximum age, select 'yes' then enter the age" />
      <Field label="Are you able to offer support to people with disabilities?" name="abilityRestriction" model={session} type="MultiField" props={{ options: disabilities, value: session.abilityRestriction }} tipTitle="Disability support" tip="Please tick all disabilities that you can cater for in your session. If you are not sure, do not tick any" />
    </div>);
  }
  renderContactFieldset = () => {
    const session = this.getSession();
    const user = this.context.user || {};
    let emailOptions = user ? [{ uuid: user.email, name: user.email }] : [];
    if (this.state) {
      if (this.state.customEmails) {
        emailOptions = emailOptions.concat(this.state.customEmails);
      }
    }
    if (session) {
      const { contactEmail } = session;
      if (contactEmail && contactEmail !== user.email) {
        emailOptions = emailOptions.concat([{ uuid: contactEmail, name: contactEmail }]);
      }
    }
    const emailProps = { options: emailOptions, addItem: this.addEmail };
    return (<div>
      <Field label="Full name" name="contactName" model={session} />
      <Field label="Phone number" name="contactPhone" model={session} />
      <Field label="Email address" name="contactEmail" model={session} type="SearchableSelect" props={emailProps} />
    </div>);
  }
  renderScheduleFieldset = () => {
    const session = this.getSession();
    return (<div>
      <Field label="Date" name="startDate" type="date" model={session} />
      <Field label="Start time" name="startTime" type="time" model={session} />
      <Field label="End time" name="endTime" type="time" model={session} />
    </div>);
  }
  render() {
    const session = this.getSession();
    return (<div className={styles.form}>
      <Authenticated message="You must login before you can add a session">
        <Sticky>
          <div className={styles.titleBar}>
            <div className={styles.titleInner}>
              <div>
                <h2>{this.props.headerText ? this.props.headerText : 'Add a session'}</h2>
                <h3>{session.title || <i>Untitled</i>}</h3>
              </div>
              <Link to={`/session/${session.uuid}`} className={`${styles.previewButton} ${this.state.autosaveState === 'pending' ? styles.disabled : ''}`}>{session.state === 'published' ? 'View' : 'Preview'}</Link>
            </div>
          </div>
        </Sticky>
        <div className={styles.formBody}>
          <Form autosave fieldsets={this.state.fieldsets} model={session} autosaveEvent={this.onAutosaveEvent} onPublish={this.onPublish} onChange={this.onChange} pendingSteps={this.state.pendingSteps}>
            {this.renderFieldsets()}
          </Form>
        </div>
      </Authenticated>
    </div>);
  }
}
