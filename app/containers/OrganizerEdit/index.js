import React, { PropTypes } from 'react';

import Fieldset from '../../components/Fieldset';
import Form from '../../components/Form';
import Field from '../../components/Field';
import PublishHeader from '../../components/PublishHeader';
import LoadingIcon from '../../components/LoadingIcon';
import LoadingMessage from '../../components/LoadingMessage';

import TextField from '../../components/Fields/Text';
import Location from '../../components/Fields/Location';
import ImageUpload from '../../components/Fields/ImageUpload';
import Bool from '../../components/Fields/BoolRadio';

import { Link } from 'react-router';

import styles from './styles.css';
import publishStyles from '../../components/PublishHeader/styles.css';

import { apiModel } from '../../utils/api';

import copy from './copy.json';

export default class OrganizerEdit extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    instance: PropTypes.object,
    params: PropTypes.object,
    location: PropTypes.object,
    headerText: PropTypes.string
  };
  static contextTypes = {
    user: PropTypes.object,
    router: PropTypes.object,
    notify: PropTypes.func
  }
  constructor() {
    super();
    this.state = {
      isPendingSave: false,
      isSaving: true,
      isLoading: true,
      fieldsets: [
        { slug: 'description', fields: ['name', 'description', 'slug', 'image'], props: { validity: 'none' } },
        { slug: 'contact', props: { validity: 'none' }, fields: ['contactName', 'contactEmail', 'contactPhone'] },
        { slug: 'social', props: { validity: 'none' }, fields: ['socialWebsite', 'socialFacebook', 'socialInstagram', 'socialTwitter', 'socialHashtag'] },
        { slug: 'location', props: { validity: 'none' }, fields: ['location'] },
        { slug: 'options', props: { validity: 'none' }, fields: ['noSchedule', 'noPricing'] }
      ],
      fields: {
        title: () => <TextField validation={{ maxLength: 50 }} {...this.getAttr('title')} />,
        description: () => <TextField multi size="XL" {...this.getDataAttr('description')} validation={{ maxLength: 1000 }} />,
        location: () => <Location {...this.getDataAttr('location')} />,
        slug: () => <TextField {...this.getAttr('slug')} validation={{ maxLength: 32 }} helper={{ start: '/organizer/' }} />,
        noSchedule: () => <Bool {...this.getDataAttr('noSchedule')} />,
        noPricing: () => <Bool {...this.getDataAttr('noPricing')} />,
        contactName: () => <TextField {...this.getDataAttr('contactName')} />,
        contactEmail: () => <TextField {...this.getDataAttr('contactEmail')} />,
        contactPhone: () => <TextField {...this.getDataAttr('contactPhone')} />,
        socialWebsite: () => <TextField placeholder="https://" {...this.getDataAttr('socialWebsite')} />,
        socialFacebook: () => <TextField placeholder="https://" {...this.getDataAttr('socialFacebook')} />,
        socialInstagram: () => <TextField placeholder="@instagoodgym" {...this.getDataAttr('socialInstagram')} />,
        socialTwitter: () => <TextField placeholder="@goodgym" {...this.getDataAttr('socialTwitter')} />,
        socialHashtag: () => <TextField placeholder="#UseYourRun" {...this.getDataAttr('socialHashtag')} />,
        image: () => <ImageUpload preview {...this.getAttr('image')} upload={{ URL: `/api/organizer/${this.state.instance.uuid}/image`, name: 'image' }} />
      }
    };
  }
  componentDidMount() {
    this.fetchData();
  }
  onChange = instance => {
    const { fieldsets } = this.state;
    const invalidValues = [undefined, 'null', '""', '[]'];
    fieldsets.filter(fieldset => fieldset.required).forEach(fieldset => {
      let validity = true;
      fieldset.required.map(field => JSON.stringify(instance[field])).forEach(val => {
        if (invalidValues.indexOf(val) >= 0) validity = false;
      });
      fieldset.props.validity = validity;
    });
    const pendingSteps = fieldsets.filter(fieldset => !fieldset.props.validity).length;
    this.setState({ fieldsets, pendingSteps });
  }
  getAttr = name => {
    const { instance } = this.state;
    return {
      value: instance[name],
      onChange: value => this.update(name, value)
    };
  }
  getDataAttr = name => {
    const { instance } = this.state;
    return {
      value: instance.data ? instance.data[name] : null,
      onChange: value => {
        let { data } = instance;
        if (!data) data = {};
        data[name] = value;
        this.update('data', data);
      }
    };
  }
  getActions = () => {
    const { instance, isSaving, isPendingSave } = this.state;
    const { tab } = this.props.params;
    const actions = [];
    if (isSaving) actions.push(<LoadingIcon key="loading" />);
    if (instance) actions.push(<Link key="view" to={`/organizer/${instance.uuid}${tab ? `?tab=${tab}` : ''}`} className={[publishStyles.previewButton, isPendingSave ? publishStyles.disabled : null].join(' ')}>{isPendingSave ? 'Saving...' : 'View'}</Link>);
    return actions;
  }
  fetchData = () => {
    const { params } = this.props;
    const { uuid } = params;
    return apiModel.get('organizer', uuid).then(res => {
      const { instance } = res;
      this.setState({ instance, isSaving: false, isLoading: false });
    });
  }
  update = (name, value) => {
    const { instance } = this.state;
    instance[name] = value;
    this.onChange(instance);
    this.setState({ status: '', instance });
    this.autosave(2000);
  }
  errorClick = event => {
    const { target } = event;
    const { tab, field } = target.dataset;
    const { instance } = this.state;
    if (!tab) return;
    this.context.router.push(`${instance.href}/edit/${tab}#${field}`);
  }
  notify(...args) {
    if (this.notification) this.notification.redact();
    this.notification = this.context.notify.apply(this.context.notify, args);
    return this.notification;
  }
  autosave = (ms) => {
    if (this.timeout) clearTimeout(this.timeout);
    this.setState({ isPendingSave: true, status: 'Saving...', saveState: 'saving' });
    this.timeout = setTimeout(() => {
      this.setState({ isSaving: true, isPendingSave: false, status: 'Saving...', saveState: 'saving' });
      const { instance } = this.state;
      if (instance.state !== 'unpublished') {
        instance.state = 'draft';
      }
      apiModel.edit('organizer', instance.uuid, instance).then(result => {
        const { error } = result;
        if (this.state.isPendingSave) return true;
        if (error) throw new Error(error);
        this.setState({ isPendingSave: false, isSaving: false, instance: result.instance, status: 'Saved draft!', saveState: 'saved' });
        return result;
      }).catch(result => {
        this.setState({ status: 'Failed saving', isPendingSave: false, isSaving: false, saveState: 'error' });
        console.error(result.error);
        this.notify('Autosave failed', 'error');
      });
    }, ms);
  }
  action(action) {
    return apiModel.action('organizer', this.state.instance.uuid, action).then(({ instance, redirect, message, messageType }) => {
      if (redirect) this.context.router.push(redirect);
      if (message) this.notify(message, messageType);
      if (instance) this.setState({ instance });
    }).catch(res => this.notify(<p onClick={this.errorClick} dangerouslySetInnerHTML={{ __html: res.error }} />, 'error'));
  }
  renderForm = () => <Form fieldsets={this.state.fieldsets} pendingSteps={this.state.pendingSteps} status={this.state.status} saveState={this.state.saveState} tab={this.props.params.tab} activeField={this.props.location.hash.slice(1)}>{this.renderFieldsets()}</Form>
  renderFieldsets = () => this.state.fieldsets.map((fieldset, key) => <Fieldset key={key} {...fieldset.props} {...copy.fieldsets[fieldset.slug]}>{this.renderFieldset(fieldset)}</Fieldset>)
  renderFieldset = fieldset => <div>{fieldset.fields.map(this.renderField)}</div>
  renderField = (field, index) => <Field key={field} index={index} {...copy.fields[field]}>{this.state.fields[field] ? this.state.fields[field]() : <TextField {...this.getAttr(field)} />}</Field>
  render() {
    const { instance } = this.state;
    return (<div className={styles.form}>
      <PublishHeader h2="Edit organizer" h3={instance ? instance.name : <i>Untitled</i>} actions={this.getActions()} />
      <div className={styles.formBody}>
        {this.state.isLoading ? <LoadingMessage message="Loading" ellipsis /> : this.renderForm()}
      </div>
    </div>);
  }
}
