import React, { PropTypes } from 'react';

import Fieldset from '../../components/Fieldset';
import Form from '../../components/Form';
import Field from '../../components/Field';
import GenderSVG from '../../components/SVGs/Gender';
import PublishHeader from '../../components/PublishHeader';
import LoadingIcon from '../../components/LoadingIcon';
import LoadingMessage from '../../components/LoadingMessage';

import TextField from '../../components/TextField';
import DateField from '../../components/Fields/Date';
import TimeField from '../../components/TimeField';
import BoolRadio from '../../components/Fields/BoolRadio';
import IconRadio from '../../components/Fields/IconRadio';
import Location from '../../components/Fields/Location';
import SearchableSelect from '../../components/SearchableSelect';
import MultiField from '../../components/MultiField';
import ImageUpload from '../../components/Fields/ImageUpload';
import Relation from '../../components/RelationField';
import Optional from '../../components/OptionalField';
import JSONList from '../../components/Fields/JSONList';
import NumField from '../../components/NumField';
import PricingField from '../../components/Fields/Pricing';

import { Link } from 'react-router';
import Authenticated from '../../components/Authenticated';

import styles from './styles.css';
import publishStyles from '../../components/PublishHeader/styles.css';

import { apiModel } from '../../utils/api';

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
    notifications: PropTypes.array,
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
      fieldsets: [
        { slug: 'description', required: ['title', 'OrganizerUuid', 'description', 'ActivityUuid'], fields: ['title', 'OrganizerUuid', 'description', 'ActivityUuid'], props: { validity: false } },
        { slug: 'additional', required: ['leader'], props: { validity: false }, fields: ['preparation', 'leader', 'hasCoaching'] },
        { slug: 'location', required: ['location'], props: { validity: false }, fields: ['location', 'meetingPoint'] },
        { slug: 'pricing', props: { validity: 'none' }, fields: ['pricing'] },
        { slug: 'restrictions', props: { validity: 'none' }, fields: ['genderRestriction', 'minAgeRestriction', 'maxAgeRestriction', 'abilityRestriction'] },
        { slug: 'contact', props: { validity: 'none' }, fields: ['contactName', 'contactEmail', 'contactPhone'] },
        { slug: 'social', props: { validity: 'none' }, fields: ['socialWebsite', 'socialFacebook', 'socialInstagram', 'socialTwitter', 'socialHashtag'] },
        { slug: 'photo', props: { validity: 'none' }, fields: ['image'] },
        { slug: 'schedule', required: ['schedule'], props: { validity: false }, fields: ['schedule'] }
      ],
      fields: {
        title: () => <TextField validation={{ maxLength: 50 }} {...this.getAttr('title')} />,
        OrganizerUuid: () => <Relation {...this.getAttr('OrganizerUuid')} props={{ placeholder: 'E.g. Richmond Volleyball' }} relation={{ model: 'organizer', query: { owner: this.context.user ? this.context.user.user_id : null } }} />,
        description: () => <TextField multi size="XL" {...this.getAttr('description')} validation={{ maxLength: 2000 }} />,
        ActivityUuid: () => <Relation {...this.getAttr('ActivityUuid')} relation={{ model: 'activity', query: { } }} props={{ lazyLoad: true, maxOptions: 5 }} />,
        preparation: () => <TextField multi validation={{ maxLength: 500 }} {...this.getAttr('preparation')} />,
        leader: () => <TextField {...this.getAttr('leader')} />,
        hasCoaching: () => <BoolRadio {...this.getAttr('hasCoaching')} options={[{ text: 'No, the session is unlead' }, { text: 'Yes, the session is coached' }]} />,
        location: () => <Location {...this.getAttr('location')} dataValue={this.state.session.locationData} onDataChange={value => this.updateSession('locationData', value)} />,
        meetingPoint: () => <TextField multi validation={{ maxLength: 500 }} {...this.getAttr('meetingPoint')} />,
        pricing: () => <PricingField {...this.getAttr('pricing')} />,
        quantity: () => <NumField {...this.getAttr('quantity')} validation={{ min: 0 }} />,
        genderRestriction: () => <IconRadio options={GENDER_OPTIONS} {...this.getAttr('genderRestriction')} />,
        minAgeRestriction: () => <Optional {...this.getAttr('minAgeRestriction')} component={{ type: NumField, props: { validation: { min: 0, max: this.state.session.maxAgeRestriction || MAX_AGE }, format: ': years old' } }} null="0" />,
        maxAgeRestriction: () => <Optional {...this.getAttr('maxAgeRestriction')} component={{ type: NumField, props: { validation: { min: this.state.session.minAgeRestriction || 0, max: MAX_AGE }, format: ': years old' } }} null="0" />,
        abilityRestriction: () => <MultiField options={DISABILITIES} {...this.getAttr('abilityRestriction')} />,
        contactName: () => <TextField {...this.getAttr('contactName')} />,
        contactEmail: () => <SearchableSelect {...this.getAttr('contactEmail')} onChange={value => this.updateSession('contactEmail', value || '')} options={this.getEmails()} addItem={this.addEmail} />,
        contactPhone: () => <TextField {...this.getAttr('contactPhone')} />,
        socialWebsite: () => <TextField placeholder="https://" {...this.getAttr('socialWebsite')} />,
        socialFacebook: () => <TextField placeholder="https://" {...this.getAttr('socialFacebook')} />,
        socialInstagram: () => <TextField placeholder="@instagoodgym" {...this.getAttr('socialInstagram')} />,
        socialTwitter: () => <TextField placeholder="@goodgym" {...this.getAttr('socialTwitter')} />,
        socialHashtag: () => <TextField placeholder="#UseYourRun" {...this.getAttr('socialHashtag')} />,
        image: () => <ImageUpload preview {...this.getAttr('image')} upload={{ URL: `/api/session/${this.state.session.uuid}/image`, name: 'image' }} />,
        schedule: () => <JSONList
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
  getAttr = name => {
    const { session } = this.state;
    return {
      value: session[name],
      onChange: value => this.updateSession(name, value)
    };
  }
  getActions = () => {
    const { session, isSaving, isPendingSave } = this.state;
    const { params } = this.props;
    const isPublished = session.state === 'published';
    const actions = [];
    if (isSaving) actions.push(<LoadingIcon />);
    if (session.state) {
      let text = isPublished ? 'View' : 'Preview';
      if (isPendingSave) text = 'Saving...';
      const viewURL = `/session/${session.uuid}${params.tab ? `?tab=${params.tab}` : ''}`;
      actions.push(<Link key="view" to={viewURL} className={[publishStyles.previewButton, isPendingSave ? publishStyles.disabled : null].join(' ')}>{text}</Link>);
      actions.push(<a key="publish" onClick={isPublished ? this.unpublishSession : this.publishSession} className={[publishStyles[`action${isPublished ? 'Unpublish' : 'Publish'}`], isPendingSave ? publishStyles.disabled : null].join(' ')}>{isPublished ? 'Unpublish' : 'Publish'}</a>);
    }
    return actions;
  }
  getEmails() {
    const { session } = this.state;
    const user = this.context.user || {};
    let emailOptions = user ? [{ uuid: user.email, name: user.email }] : [];
    if (this.state.customEmails) emailOptions = emailOptions.concat(this.state.customEmails);
    if (session) {
      const { contactEmail } = session;
      if (contactEmail && contactEmail !== user.email) {
        emailOptions.push({ uuid: contactEmail, name: contactEmail });
      }
    }
    return emailOptions;
  }
  fetchData = () => {
    const { session, params, location } = this.props;
    const uuid = session ? session.uuid : (params.uuid || null);
    return uuid
      ? apiModel.get('session', uuid).then(res => {
        this.onChange(res.instance);
        this.setState({ session: res.instance, isSaving: false, isLoading: false });
      })
      : apiModel.new('session', location.query).then(res => {
        this.context.notify('You have created a new session', 'success');
        this.context.router.push(`${res.instance.href}/edit`);
      });
  }
  updateSession = (name, value) => {
    const { session } = this.state;
    session[name] = value;
    this.onChange(session);
    this.setState({ status: '', session });
    this.autosave(2000);
  }
  errorClick = event => {
    const { target } = event;
    const { tab, field } = target.dataset;
    const { session } = this.state;
    if (!tab) return;
    this.context.router.push(`${session.href}/edit/${tab}#${field}`);
  }
  changeSessionState = state => {
    const { session } = this.state;
    const oldState = session.state;
    session.state = state;
    return new Promise((resolve, reject) => {
      apiModel.edit('session', session.uuid, session).then(res => {
        this.setState({ session: res.instance });
        resolve(res);
      }).catch(res => {
        session.state = oldState;
        this.context.notify(<p onClick={this.errorClick} dangerouslySetInnerHTML={{ __html: res.error }} />, 'error');
        reject(res.error);
      });
    });
  }
  publishSession = () => this.changeSessionState('published').then(() => this.context.notify('Your session has been published!', 'success')).then(() => this.context.router.push(this.state.session.href))
  unpublishSession = () => this.changeSessionState('unpublished').then(() => this.context.notify('Your session has been unpublished!', 'warn'))
  addEmail = (email) => {
    this.setState({ customEmails: [{ uuid: email, name: email }] });
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
        return result;
      }).catch(result => {
        this.setState({ status: 'Failed saving', isPendingSave: false, isSaving: false, saveState: 'error' });
        console.error(result.error);
        this.context.notify('Autosave failed', 'error');
      });
    }, ms);
  }
  renderForm = () => <Form fieldsets={this.state.fieldsets} onPublish={this.publishSession} pendingSteps={this.state.pendingSteps} status={this.state.status} saveState={this.state.saveState} tab={this.props.params.tab} activeField={this.props.location.hash.slice(1)} notifications={this.context.notifications}>{this.renderFieldsets()}</Form>
  renderFieldsets = () => this.state.fieldsets.map((fieldset, key) => <Fieldset key={key} {...fieldset.props} {...this.state.copy.fieldsets[fieldset.slug]}>{this.renderFieldset(fieldset)}</Fieldset>)
  renderFieldset = fieldset => <div>{fieldset.fields.map(this.renderField)}</div>
  renderField = field => <Field key={field} {...this.state.copy.fields[field]}>{this.state.fields[field] ? this.state.fields[field]() : <TextField {...this.getAttr(field)} />}</Field>
  render() {
    const { session } = this.state;
    return (<div className={styles.form}>
      <Authenticated message="You must login before you can add a session">
        <PublishHeader h2={this.props.headerText ? this.props.headerText : 'Add a session'} h3={session.title || <i>Untitled</i>} actions={this.getActions()} />
        <div className={styles.formBody}>
          {this.state.isLoading ? <LoadingMessage message="Loading" ellipsis /> : this.renderForm()}
        </div>
      </Authenticated>
    </div>);
  }
}
