import React, { PropTypes } from 'react';

import Fieldset from '../../components/Fieldset';
import Form from '../../components/Form';
import Field from '../../components/Field';
import GenderSVG from '../../components/SVGs/Gender';
import PublishHeader from '../../components/PublishHeader';
import LoadingIcon from '../../components/LoadingIcon';
import LoadingMessage from '../../components/LoadingMessage';

import JSONField from '../../components/Fields/JSON';
import RegExpField from '../../components/Fields/RegExp';
import { TextField, DateField, TimeField, BoolRadio, IconRadio, Location, SearchableSelect, MultiBool, ImageUpload, Relation, Optional, JSONList, NumberField, Pricing } from '../../components/Fields';

import { Link } from 'react-router';
import Authenticated from '../../components/Authenticated';

import styles from './styles.css';
import publishStyles from '../../components/PublishHeader/styles.css';

import Button from '../../components/Button';

import { apiModel, apiFetch } from '../../utils/api';

import formCopy from './copy.json';

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
    notify: PropTypes.func
  }
  constructor(props) {
    super(props);
    const MAX_AGE = 120;
    const GENDER_OPTIONS = [
      { text: 'NONE (MIXED)', value: 'mixed', icon: <GenderSVG /> },
      { text: 'MALE ONLY', value: 'male', icon: <GenderSVG only="male" /> },
      { text: 'FEMALE ONLY', value: 'female', icon: <GenderSVG only="female" /> }
    ];
    const DISABILITIES = ['Learning disability', 'Mental health condition', 'Physical impairment', 'Visual impairment', 'Deaf', 'Please ask for more info'];
    this.state = {
      session: props.session || {},
      isPendingSave: false,
      isSaving: true,
      isLoading: true,
      copy: formCopy,
      fieldsets: [],
      fields: {
        title: () => <TextField validation={{ maxLength: 50 }} {...this.getAttr('title')} />,
        OrganizerUuid: () => <Relation {...this.getAttr('OrganizerUuid')} listKey="activities" props={{ placeholder: 'E.g. Richmond Volleyball' }} relation={{ model: 'organizer', query: { canAct: 'edit' } }} />,
        description: () => <TextField multi size="XL" {...this.getAttr('description')} validation={{ maxLength: 2000 }} />,
        Activities: () => <JSONList
          {...this.getAttrRelation('Activities')}
          onAddEmpty={() => ({})}
          addText="Add category"
          deleteText="Delete category"
          maxLength={3}
          components={[
            { Component: Relation, props: { size: 'small', relation: { model: 'activity' }, name: 'uuid', props: { lazyLoad: true, maxOptions: 5, placeholder: 'E.g. Badminton' } } }
          ]}
        />,
        preparation: () => <TextField multi validation={{ maxLength: 500 }} {...this.getAttr('preparation')} />,
        leader: () => <SearchableSelect {...this.getAttr('leader')} onChange={value => this.updateSession('leader', value || '')} options={this.getNames()} addItem={this.addName('leader')} lazyLoad />,
        hasCoaching: () => <BoolRadio {...this.getAttr('hasCoaching')} options={[{ text: 'No, the session is unlead' }, { text: 'Yes, the session is coached' }]} />,
        location: () => <Location {...this.getLocation()} />,
        meetingPoint: () => <TextField multi validation={{ maxLength: 500 }} {...this.getAttr('meetingPoint')} />,
        pricing: () => <Pricing {...this.getAttr('pricing')} />,
        quantity: () => <NumberField {...this.getAttr('quantity')} validation={{ min: 0 }} />,
        genderRestriction: () => <IconRadio options={GENDER_OPTIONS} {...this.getAttr('genderRestriction')} />,
        minAgeRestriction: () => <Optional {...this.getAttr('minAgeRestriction')} component={{ type: NumberField, props: { validation: { min: 0, max: this.state.session.maxAgeRestriction || MAX_AGE }, format: ': years old' } }} null="0" />,
        maxAgeRestriction: () => <Optional {...this.getAttr('maxAgeRestriction')} component={{ type: NumberField, props: { validation: { min: this.state.session.minAgeRestriction || 0, max: MAX_AGE }, format: ': years old' } }} null="0" />,
        abilityRestriction: () => <MultiBool options={DISABILITIES} {...this.getAttr('abilityRestriction')} />,
        contactName: () => <SearchableSelect {...this.getAttr('contactName')} onChange={value => this.updateSession('contactName', value || '')} options={this.getNames()} addItem={this.addName('contactName')} lazyLoad />,
        contactEmail: () => <SearchableSelect {...this.getAttr('contactEmail')} onChange={value => this.updateSession('contactEmail', value || '')} options={this.getEmails()} addItem={this.addEmail} lazyLoad />,
        contactPhone: () => <TextField {...this.getAttr('contactPhone')} />,
        socialWebsite: () => <TextField placeholder="https://" {...this.getAttr('socialWebsite')} />,
        socialFacebook: () => <TextField placeholder="https://" {...this.getAttr('socialFacebook')} />,
        socialInstagram: () => <TextField placeholder="@instagoodgym" {...this.getAttr('socialInstagram')} />,
        socialTwitter: () => <TextField placeholder="@goodgym" {...this.getAttr('socialTwitter')} />,
        socialHashtag: () => <TextField placeholder="#UseYourRun" {...this.getAttr('socialHashtag')} />,
        image: () => <ImageUpload preview {...this.getAttr('image')} upload={{ URL: `/api/session/${this.state.session.uuid}/image`, name: 'image' }} />,
        schedule: () => <JSONList
          {...this.getAttrRelation('schedule')}
          addText="Add another date"
          onAddEmpty={newRow => {
            if (newRow.startDate) {
              const date = new Date(newRow.startDate);
              date.setDate(date.getDate() + 7);
              newRow.startDate = date.toISOString().substr(0, 10);
            }
            return newRow;
          }}
          maxLength={10}
          maxText="Open Sessions is still in 'beta' mode. You have reached the maximum number of sessions that can be scheduled"
          components={[
            { label: 'Date', Component: DateField, props: { name: 'startDate' } },
            { label: 'Start time', Component: TimeField, props: { name: 'startTime' } },
            { label: 'End time', Component: TimeField, props: { name: 'endTime' } }
          ]}
        />,
        metadata: () => <JSONField {...this.getAttr('metadata')} guides={[{ key: 'titleMatch', render: (value, onChange) => <RegExpField value={value} onChange={onChange} /> }]} />
      }
    };
  }
  componentDidMount() {
    this.fetchData();
  }
  onChange = session => {
    const { fieldsets } = this.state;
    const invalidValues = [undefined, 'null', '""', '[]'];
    fieldsets.filter(fieldset => fieldset.required).forEach(fieldset => {
      let validity = true;
      fieldset.required.map(field => JSON.stringify(session[field])).forEach(val => {
        if (invalidValues.indexOf(val) >= 0) validity = false;
      });
      fieldset.props.validity = validity;
    });
    const pendingSteps = fieldsets.filter(fieldset => !fieldset.props.validity).length;
    this.setState({ fieldsets, pendingSteps });
  }
  setActivities(activities) {
    const { Activities } = this.state.session;
    let uuids = activities.map(activity => activity.uuid).filter((uuid, key) => uuid !== null || ((key + 1) === activities.length && key));
    uuids = uuids.filter((uuid, key) => uuids.indexOf(uuid) === key);
    if (uuids.length && uuids.every((uuid, key) => uuid === Activities[key])) return;
    uuids = uuids.filter(uuid => uuid !== null);
    apiModel.action('session', this.state.session.uuid, 'setActivitiesAction', { uuids }).then(() => {
      const { session } = this.state;
      session.Activities = uuids.map(uuid => ({ uuid }));
      this.setState({ session });
    });
  }
  getFieldsets(session) {
    const { user } = this.context;
    const organizerData = session && session.Organizer && session.Organizer.data ? session.Organizer.data : {};
    const fieldsets = [
      { slug: 'description', required: ['title', 'OrganizerUuid', 'description', 'Activities'], fields: ['title', 'OrganizerUuid', 'description', 'Activities'], props: { validity: false } },
      { slug: 'additional', required: ['leader'], props: { validity: false }, fields: ['preparation', 'leader', 'hasCoaching'] },
    ];
    fieldsets.push({ slug: 'location', required: ['location'], props: { validity: false }, fields: ['location', 'meetingPoint'] });
    if (!organizerData.noPricing) fieldsets.push({ slug: 'pricing', props: { validity: 'none' }, fields: ['pricing'] });
    fieldsets.push({ slug: 'restrictions', props: { validity: 'none' }, fields: ['genderRestriction', 'minAgeRestriction', 'maxAgeRestriction', 'abilityRestriction'] });
    fieldsets.push({ slug: 'contact', required: ['contactName', 'contactEmail'], props: { validity: false }, fields: ['contactName', 'contactEmail', 'contactPhone'] });
    fieldsets.push({ slug: 'social', props: { validity: 'none' }, fields: ['socialWebsite', 'socialFacebook', 'socialInstagram', 'socialTwitter', 'socialHashtag'] });
    fieldsets.push({ slug: 'photo', props: { validity: 'none' }, fields: ['image'] });
    if (!organizerData.noSchedule) fieldsets.push({ slug: 'schedule', required: ['schedule'], props: { validity: false }, fields: ['schedule'] });
    if (user.partner) fieldsets.push({ slug: 'partner', props: { validity: 'none' }, fields: ['metadata'] });
    return this.setState({ fieldsets });
  }
  getAttr = name => {
    const { session } = this.state;
    let data = session;
    if (this.organizerOverride(name)) data = session.Organizer.data;
    return {
      value: data[name],
      onChange: value => this.updateSession(name, value)
    };
  }
  getAttrRelation = name => {
    const { session } = this.state;
    return {
      value: session[name] && session[name].length ? session[name] : ([{}]),
      onChange: value => this.updateSession(name, value)
    };
  }
  getLocation() {
    const { location, locationData } = this.state.session;
    if (this.organizerOverride('location')) {
      const { Organizer } = this.state.session;
      const { data } = Organizer;
      return { value: data.location };
    }
    return {
      value: { address: location, data: locationData },
      onChange: value => {
        this.updateSession('location', value.address);
        this.updateSession('locationData', value.data);
      }
    };
  }
  getActions = () => {
    const { session, isSaving, isPendingSave } = this.state;
    const { params } = this.props;
    const actions = [];
    const visibleActions = ['view', 'publish', 'unpublish'];
    if (isSaving) actions.push(<LoadingIcon key="loading" />);
    if (session.state) actions.push(<Link key="view" to={`${session.href}${params.tab ? `?tab=${params.tab}` : ''}`} className={[publishStyles.previewButton, isPendingSave ? publishStyles.disabled : null].join(' ')}>{isPendingSave ? 'Saving...' : 'Preview'}</Link>);
    if (session.actions) {
      const actionStyle = { publish: 'live', unpublish: 'draft' };
      visibleActions.filter(action => session.actions.some(allowed => allowed === action)).forEach(action => {
        actions.push(<Button
          key={action}
          onClick={() => this.action(action)}
          style={isPendingSave ? 'disabled' : actionStyle[action]}
        >{action}</Button>);
      });
    }
    return actions;
  }
  getNames() {
    const { session, customNames, personList } = this.state;
    const { user } = this.context;
    let options = [];
    if (session) {
      const { contactName, leader } = session;
      if (leader) options.push(leader);
      if (contactName) options.push(contactName);
    }
    if (personList) options = options.concat(personList);
    if (user && user.nickname.match(/^[A-Z]/)) options.push(user.nickname);
    if (customNames) options = options.concat(customNames);
    return options.filter((name, key) => options.indexOf(name) === key).map(name => ({ uuid: name, name }));
  }
  getEmails() {
    const { session, customEmails } = this.state;
    const user = this.context.user || {};
    let emailOptions = user ? [user.email] : [];
    if (customEmails) emailOptions = emailOptions.concat(customEmails);
    if (session) {
      const { contactEmail } = session;
      if (contactEmail && contactEmail !== user.email) {
        emailOptions.push(contactEmail);
      }
    }
    return emailOptions.map(name => ({ uuid: name, name }));
  }
  fetchData = () => {
    const { session, params, location } = this.props;
    const uuid = session ? session.uuid : (params.uuid || null);
    return uuid
      ? apiModel.get('session', uuid).then(res => {
        this.onChange(res.instance);
        this.setState({ session: res.instance, isSaving: false, isLoading: false });
        apiFetch('/api/leader-list').then(result => this.setState({ personList: result.list }));
        this.getFieldsets(res.instance);
      })
      : apiModel.new('session', location.query).then(res => {
        if (!(location.hash && location.hash === '#welcome')) this.notify('You have created a new session', 'success');
        this.context.router.replace(`${res.instance.href}/edit`);
      });
  }
  updateSession = (n, v) => {
    const { session } = this.state;
    if (n === 'Activities') this.setActivities(v);
    else {
      let names = n;
      let values = v;
      if (!(n instanceof Array)) {
        names = [n];
        values = [v];
      }
      names.forEach((name, key) => {
        session[name] = values[key];
      });
      this.onChange(session);
      this.setState({ status: '', session });
      this.autosave(2000);
    }
  }
  errorClick = event => {
    const { target } = event;
    const { tab, field } = target.dataset;
    const { session } = this.state;
    if (!tab) return;
    this.context.router.push(`${session.href}/edit/${tab}#${field}`);
  }
  notify(...args) {
    if (this.notification) this.notification.redact();
    this.notification = this.context.notify.apply(this.context.notify, args);
    return this.notification;
  }
  addName = key => name => {
    this.updateSession(key, name);
    return Promise.resolve();
  }
  addEmail = email => {
    this.setState({ customEmails: [email] });
    this.updateSession('contactEmail', email);
  }
  autosave = (ms) => {
    if (this.timeout) clearTimeout(this.timeout);
    this.setState({ isPendingSave: true, status: 'Saving...', saveState: 'saving' });
    this.timeout = setTimeout(() => {
      this.setState({ isSaving: true, isPendingSave: false, status: 'Saving...', saveState: 'saving' });
      const { session } = this.state;
      if (session.state !== 'unpublished') {
        session.state = 'draft';
      }
      apiModel.edit('session', session.uuid, session).then(result => {
        const { instance, error } = result;
        if (this.state.isPendingSave) return true;
        if (error) throw new Error(error);
        this.setState({ isPendingSave: false, isSaving: false, session: instance, status: 'Saved draft!', saveState: 'saved' });
        this.getFieldsets(instance);
        return result;
      }).catch(result => {
        this.setState({ status: 'Failed saving', isPendingSave: false, isSaving: false, saveState: 'error' });
        console.error(result.error);
        this.notify('Autosave failed', 'error');
      });
    }, ms);
  }
  action(action) {
    return apiModel.action('session', this.state.session.uuid, action).then(({ instance, redirect, message, messageType }) => {
      if (redirect) this.context.router.push(redirect);
      if (message) this.notify(message, messageType);
      if (instance) this.setState({ session: instance });
    }).catch(res => this.notify(<p onClick={this.errorClick} dangerouslySetInnerHTML={{ __html: res.error }} />, 'error'));
  }
  organizerOverride(field) {
    const { session } = this.state;
    if (session && session.OrganizerUuid && session.Organizer && session.Organizer.data && field !== 'description' && field !== 'leader') {
      const { data } = session.Organizer;
      if ((data.noPricing && data.noPricing !== 'false' && field === 'pricing') || (data.noSchedule && data.noSchedule !== 'false' && field === 'schedule')) return <p>This field is disabled by the organiser (<Link to={`${session.Organizer.href}/edit`}>edit</Link>)</p>;
      return data[field] && field === 'location' ? data[field].address : data[field];
    }
    return false;
  }
  renderForm = () => <Form readyText="Ready to publish!" fieldsets={this.state.fieldsets} onPublish={() => this.action('publish')} pendingSteps={this.state.pendingSteps} status={this.state.status} saveState={this.state.saveState} tab={this.props.params.tab} activeField={this.props.location.hash.slice(1)}>{this.renderFieldsets()}</Form>
  renderFieldsets = () => this.state.fieldsets.map((fieldset, key) => <Fieldset key={key} {...fieldset.props} {...this.state.copy.fieldsets[fieldset.slug]}>{this.renderFieldset(fieldset)}</Fieldset>)
  renderFieldset = fieldset => <div>{fieldset.fields.map(this.renderField)}</div>
  renderField = (field, index) => {
    const override = this.organizerOverride(field);
    if (override) return <Field key={index} index={index} {...this.state.copy.fields[field]} label={<span>{this.state.copy.fields[field].label} <i>(taken from <Link to={`${this.state.session.Organizer.href}/edit`}>organiser</Link>)</i></span>}><div className={styles.disabledField}>{override}</div></Field>;
    return <Field key={index} index={index} {...this.state.copy.fields[field]}>{this.state.fields[field] ? this.state.fields[field]() : <TextField {...this.getAttr(field)} />}</Field>;
  }
  render() {
    const { session } = this.state;
    const { headerText } = this.props;
    return (<div className={styles.form}>
      <Authenticated message="You must login before you can add a session">
        {headerText ? <PublishHeader h2={headerText} h3={session.title || <i>Untitled</i>} actions={this.getActions()} /> : null}
        <div className={styles.formBody}>
          {this.state.isLoading ? <LoadingMessage message="Loading" ellipsis /> : this.renderForm()}
        </div>
      </Authenticated>
    </div>);
  }
}
