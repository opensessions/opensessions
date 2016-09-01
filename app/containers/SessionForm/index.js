import React, { PropTypes } from 'react';

import Fieldset from 'components/Fieldset';
import Form from 'components/Form';
import Field from 'components/Field';
import GenderSvg from 'components/GenderSvg';
import PublishHeader from 'components/PublishHeader';

import TextField from 'components/TextField';
import DateField from 'components/DateField';
import TimeField from 'components/TimeField';
import BoolRadio from 'components/BoolRadioField';
import IconRadio from 'components/IconRadioField';
import Location from 'components/LocationField';
import SearchableSelect from 'components/SearchableSelect';
import MultiField from 'components/MultiField';
import ImageUpload from 'components/ImageUploadField';
import Relation from 'components/RelationField';
import Optional from 'components/OptionalField';
import JSONList from 'components/JSONListField';
import NumField from 'components/NumField';

import { Link } from 'react-router';
import Authenticated from 'components/Authenticated';

import styles from './styles.css';
import publishStyles from '../../components/PublishHeader/styles.css';

import { apiModel } from '../../utils/api';

export default class SessionForm extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    session: PropTypes.object,
    params: PropTypes.object,
    location: PropTypes.object,
    headerText: PropTypes.string
  };
  static contextTypes = {
    user: PropTypes.object,
    router: PropTypes.object,
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
        { renderer: this.renderPricingFieldset, slug: 'pricing', props: { label: 'Pricing', validity: 'none', title: 'Add pricing for your session', subtitle: 'If your session is paid, describe pricing levels here' } },
        { renderer: this.renderRestrictionsFieldset, slug: 'restrictions', props: { label: 'Who it\'s for', validity: 'none', title: 'Who is your session for?', subtitle: 'Specify any restrictions that apply and disabilities catered for' } },
        { renderer: this.renderContactFieldset, slug: 'contact', props: { label: 'Contact info', validity: 'none', title: 'Who can people talk to about this session?', subtitle: 'Help potential attendees by providing details of who they can contact' } },
        { renderer: this.renderScheduleFieldset, slug: 'schedule', required: ['schedule'], props: { label: 'Add a schedule', heading: 'Scheduling', validity: false, title: 'Add a schedule for your sessions', subtitle: 'You can add multiple dates for sessions which occur regularly' } }
      ]
    };
  }
  componentDidMount() {
    this.fetchData();
  }
  onChange = (session) => {
    const { fieldsets } = this.state;
    const invalidValues = [undefined, 'null', '""', '[]'];
    let pendingSteps = 0;
    fieldsets.forEach((fieldset, key) => {
      let validity = 'none';
      if (fieldset.required) {
        validity = true;
        fieldset.required.forEach(field => {
          if (invalidValues.filter(value => value === JSON.stringify(session[field])).length !== 0) validity = false;
        });
        if (!validity) pendingSteps += 1;
      }
      fieldsets[key].props.validity = validity;
    });
    this.setState({ fieldsets, pendingSteps });
  }
  getSession() {
    let { session } = this.state;
    if (!session) session = {};
    session.update = this.updateSession;
    session.publish = this.publishSession;
    return session;
  }
  getAttr = name => {
    const session = this.getSession();
    return {
      value: session[name],
      onChange: value => this.updateSession(name, value)
    };
  }
  getActions = () => {
    const { session, autosaveState } = this.state;
    const { params } = this.props;
    const isPublished = session.state === 'published';
    const isSaving = autosaveState === 'pending';
    const actions = [];
    if (session.state) {
      let text = isPublished ? 'View' : 'Preview';
      if (isSaving) text = 'Saving...';
      const viewURL = `/session/${session.uuid}${params.tab ? `?tab=${params.tab}` : ''}`;
      actions.push(<Link key="view" to={viewURL} className={`${publishStyles.previewButton} ${isSaving ? publishStyles.disabled : ''}`}>{text}</Link>);
      actions.push(<a key="publish" onClick={isPublished ? this.unpublishSession : this.publishSession} className={publishStyles[`action${isPublished ? 'Unpublish' : 'Publish'}`]}>{isPublished ? 'Unpublish' : 'Publish'}</a>);
    }
    return actions;
  }
  fetchData = () => {
    const { session, params, location } = this.props;
    const { router } = this.context;
    const uuid = session ? session.uuid : (params.uuid || null);
    if (uuid) {
      apiModel.get('session', uuid).then(res => {
        this.onChange(res.instance);
        this.setState({ session: res.instance });
      });
    } else {
      apiModel.new('session', location.query).then(res => {
        router.push(`${res.instance.href}/edit`);
      });
    }
  }
  updateSession = (name, value) => {
    const session = this.getSession();
    session[name] = value;
    this.onChange(session);
    this.setState({ status: '', session });
    this.autosave(1600);
  }
  changeSessionState = (state) => {
    const session = this.getSession();
    const oldState = session.state;
    session.state = state;
    return new Promise((resolve, reject) => {
      apiModel.edit('session', session.uuid, session).then(res => {
        this.setState({ session: res.instance });
        resolve(res);
      }).catch(res => {
        session.state = oldState;
        this.setState({ status: res.error, saveState: 'error' });
        reject(res.error);
      });
    });
  }
  publishSession = () => this.changeSessionState('published').then(() => this.context.router.push(this.state.session.href))
  unpublishSession = () => this.changeSessionState('unpublished')
  addEmail = (email) => {
    this.setState({ customEmails: [{ uuid: email, name: email }] });
    this.updateSession('contactEmail', email);
  }
  autosave = (ms) => {
    if (this.timeout) clearTimeout(this.timeout);
    this.setState({ autosaveState: 'pending', status: 'Saving...', saveState: 'saving' });
    this.timeout = setTimeout(() => {
      const session = this.getSession();
      if (session.state !== 'unpublished') {
        session.state = 'draft';
      }
      this.setState({ status: 'Saving...', saveState: 'saving' });
      return apiModel.edit('session', session.uuid, session).then(result => {
        const { instance, error } = result;
        if (error) {
          throw new Error(error);
        } else {
          this.setState({ autosaveState: 'saved', session: instance, status: `Saved ${session.state === 'published' ? 'and published' : 'as draft'}!`, saveState: 'saved' });
        }
        return result;
      }).catch(result => {
        this.setState({ status: `Failed saving: ${result.error}`, autosaveState: 'saved', saveState: 'error' });
      });
    }, ms);
  }
  renderFieldsets() {
    let key = 0;
    return this.state.fieldsets.map(fieldset => <Fieldset key={++key} {...fieldset.props}>{fieldset.renderer()}</Fieldset>);
  }
  renderDescriptionFieldset = () => {
    const user = this.context.user || {};
    return (<div>
      <Field label="Session Title" tip="Enter a title for your session" example="E.g. Volleyball training">
        <TextField validation={{ maxLength: 50 }} {...this.getAttr('title')} />
      </Field>
      <Field label="Organiser Name" name="OrganizerUuid" tip="Enter the name of your club or organisation. If you don't represent a club or organisation, enter your own name" example="E.g. Richmond Volleyball">
        <Relation {...this.getAttr('OrganizerUuid')} props={{ placeholder: 'E.g. Richmond Volleyball' }} relation={{ model: 'organizer', query: { owner: user.user_id } }} />
      </Field>
      <Field label="Session Description" tip="Let people know what's great about the session! Remember: the more detail you provide, the more likely people are to decide to attend." example="Tips: Who is this session for? What benefits will people get from it? What will the session be like? What will we do? Is any prior experience needed?">
        <TextField multi size="XL" {...this.getAttr('description')} />
      </Field>
      <Field label="Sport or activity type" tip="Enter the type of activity or sport on offer for this session. If multiple activities are on offer at this session, please write 'Multiple Activities'" placeholder="E.g. Volleyball" example="E.g. Volleyball">
        <Relation {...this.getAttr('ActivityUuid')} relation={{ model: 'activity', query: { } }} props={{ lazyLoad: true, maxOptions: 5 }} />
      </Field>
    </div>);
  }
  renderAdditionalFieldset = () => {
    const session = this.getSession();
    const coachOptions = [
      { text: 'No, the session is unlead' },
      { text: 'Yes, the session is coached' }
    ];
    return (<div>
      <Field label="Is there anything participants should bring?" tipTitle="What to bring" tip="Let participants know how to prepare for your session. Is there anything they will need to bring?">
        <TextField multi validation={{ maxLength: 500 }} {...this.getAttr('preparation')} />
      </Field>
      <Field label="Who is the leader for this session?" tipTitle="Session Leader" tip="Enter the name of the person who will be leading the session. It's helpful for participants to know who's in charge when they arrive" example="E.g. John Smith">
        <TextField {...this.getAttr('leader')} />
      </Field>
      <Field label="Will participants receive coaching?">
        <BoolRadio options={coachOptions} {...this.getAttr('hasCoaching')} />
      </Field>
      <Field label="Image">
        <ImageUpload preview {...this.getAttr('image')} upload={{ URL: `/api/session/${session.uuid}/image`, name: 'image' }} />
      </Field>
    </div>);
  }
  renderLocationFieldset = () => {
    const session = this.getSession();
    return (<div>
      <Field label="Address" tip="Type to search an address and select from the dropdown">
        <Location {...this.getAttr('location')} dataValue={session.locationData} onDataChange={value => session.update('locationData', value)} />
      </Field>
      <Field label="Meeting Instructions" tip="What should participants do when they arrive at the venue or location? Try to be as specific as possible." example="E.g. Meet in the main reception area">
        <TextField multi validation={{ maxLength: 500 }} {...this.getAttr('meetingPoint')} />
      </Field>
    </div>);
  }
  renderPricingFieldset = () => (<div>
    <Field label="Price">
      <Optional {...this.getAttr('price')} no="Free" yes="Paid" null="0" component={{ type: NumField, props: { validation: { min: 0 }, format: '£ :', step: '0.25' } }} />
    </Field>
    <Field label="Spaces available" tip="How many spaces are available?">
      <NumField {...this.getAttr('quantity')} validation={{ min: 0 }} />
    </Field>
  </div>)
  renderRestrictionsFieldset = () => {
    const session = this.getSession();
    const genderOptions = [
      { text: 'None (Mixed)', value: 'mixed', icon: <GenderSvg /> },
      { text: 'Male only', value: 'male', icon: <GenderSvg only="male" /> },
      { text: 'Female only', value: 'female', icon: <GenderSvg only="female" /> }
    ];
    const disabilities = ['Learning disability', 'Mental health condition', 'Physical impairment', 'Visual impairment', 'Deaf', 'Please ask for more info'];
    return (<div>
      <Field label="Gender restrictions" tipTitle="Gender restrictions" tip="Select 'none' if there are no restrictions on gender">
        <IconRadio options={genderOptions} {...this.getAttr('genderRestriction')} />
      </Field>
      <Field label="Is there a minimum age?" tipTitle="Minimum age" tip="If there is a minimum age, select 'yes' then enter the age">
        <Optional {...this.getAttr('minAgeRestriction')} component={{ type: NumField, props: { validation: { min: 0, max: session.maxAgeRestriction || 120 }, format: ': years old' } }} null="0" />
      </Field>
      <Field label="Is there a maximum age?" tipTitle="Maximum age" tip="If there is a maximum age, select 'yes' then enter the age">
        <Optional {...this.getAttr('maxAgeRestriction')} component={{ type: NumField, props: { validation: { min: session.minAgeRestriction || 0, max: 120 }, format: ': years old' } }} null="0" />
      </Field>
      <Field label="Are you able to offer support to people with disabilities?" tipTitle="Disability support" tip="Please tick all disabilities that you can cater for in your session. If you are not sure, do not tick any" fullSize>
        <MultiField options={disabilities} {...this.getAttr('abilityRestriction')} />
      </Field>
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
      <Field label="Full name"><TextField {...this.getAttr('contactName')} /></Field>
      <Field label="Phone number"><TextField {...this.getAttr('contactPhone')} /></Field>
      <Field label="Email address"><SearchableSelect {...this.getAttr('contactEmail')} {...emailProps} /></Field>
    </div>);
  }
  renderScheduleFieldset = () => (<div>
    <Field fullSize>
      <JSONList
        {...this.getAttr('schedule')}
        addText="Add another date"
        onAddEmpty={newRow => {
          if (newRow.startDate) {
            const date = new Date(newRow.startDate);
            date.setDate(date.getDate() + 7);
            newRow.startDate = date.toISOString().substr(0, 10);
          }
        }}
        maxLength={10}
        components={[
          { label: 'Date', Component: DateField, props: { name: 'startDate' } },
          { label: 'Start time', Component: TimeField, props: { name: 'startTime' } },
          { label: 'End time', Component: TimeField, props: { name: 'endTime' } }
        ]}
      />
    </Field>
  </div>)
  render() {
    const session = this.getSession();
    return (<div className={styles.form}>
      <Authenticated message="You must login before you can add a session">
        <PublishHeader h2={this.props.headerText ? this.props.headerText : 'Add a session'} h3={session.title || <i>Untitled</i>} actions={this.getActions()} />
        <div className={styles.formBody}>
          <Form fieldsets={this.state.fieldsets} onPublish={this.publishSession} pendingSteps={this.state.pendingSteps} status={this.state.status} saveState={this.state.saveState} tab={this.props.params.tab}>
            {this.renderFieldsets()}
          </Form>
        </div>
      </Authenticated>
    </div>);
  }
}
