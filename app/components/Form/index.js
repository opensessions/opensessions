import React from 'react';

import styles from './styles.css';
import fieldStyles from '../Field/styles.css';

import { apiModel } from '../../utils/api';

import trackPage from '../../utils/analytics';

export default class Form extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    autosave: React.PropTypes.bool,
    autosaveEvent: React.PropTypes.func,
    children: React.PropTypes.node.isRequired,
    model: React.PropTypes.object,
    pendingSteps: React.PropTypes.any,
    onPublish: React.PropTypes.func,
    onChange: React.PropTypes.func,
    fieldsets: React.PropTypes.array,
  }
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 0,
      saveState: 'Unsaved',
      saveStateClass: styles.unsaved,
      hasFocus: false
    };
  }
  componentDidMount() {
    this.refocus();
  }
  componentDidUpdate(oldProps, oldState) {
    if (oldState.activeTab !== this.state.activeTab) {
      this.refocus();
      const fieldset = this.props.fieldsets[this.state.activeTab];
      trackPage(`${document.location.href}#${fieldset.slug}`, `${document.location.pathname}#${fieldset.slug}`);
    }
  }
  onFocus = () => {
    this.setState({ hasFocus: true });
  }
  onBlur = () => {
    this.setState({ hasFocus: false });
  }
  getFieldsets() {
    return this.props.children instanceof Array ? this.props.children : [this.props.children];
  }
  autosave = (ms) => {
    if (this.timeout) clearTimeout(this.timeout);
    if (this.props.autosaveEvent) this.props.autosaveEvent({ type: 'pending' });
    this.timeout = setTimeout(() => {
      const { model } = this.props;
      if (model.state !== 'unpublished') {
        model.state = 'draft';
      }
      this.saveModel(model, 'Saving', 'Saved');
    }, ms);
    this.setState({ saveState: 'Saving...', saveStateClass: styles.saving });
  }
  saveModel(model, verb, verbed) {
    this.setState({ saveState: `${verb}...`, saveStateClass: styles.saving });
    return apiModel.edit('session', model.uuid, model).then(result => {
      const { instance, error } = result;
      if (error) {
        this.setState({ saveState: `Failed ${verb.toLowerCase()}: ${error}`, saveStateClass: styles.error });
      } else {
        if (this.props.autosaveEvent) this.props.autosaveEvent({ type: 'saved', state: instance.state });
        this.setState({ saveState: `${verbed} ${model.state === 'published' ? 'and published' : 'as draft'}!`, saveStateClass: styles.saved });
      }
      return result;
    });
  }
  formChange = () => {
    this.autosave(2000);
    if (this.props.onChange) this.props.onChange(this.props.model);
  }
  tabClick = (event) => {
    const key = parseInt(event.target.dataset.key, 10);
    this.setState({ activeTab: key });
  }
  actionClick = (event) => {
    const { type, target, keyCode } = event;
    if (type === 'keypress' && keyCode !== 13) return;
    const delta = target.text === 'Next' ? 1 : -1;
    this.setState({ activeTab: this.state.activeTab + delta });
  }
  refocus = () => {
    try {
      const firstShownField = Array.filter(this.refs.form.elements, (element) => element.tagName === 'FIELDSET')
        .filter((fieldset) => fieldset.parentNode.className !== styles.hiddenTab)[0].getElementsByClassName(fieldStyles.field)[0];
      firstShownField.querySelectorAll('input, textarea, select')[0].focus();
    } catch (error) {
      console.error('Couldn\'t refocus', error);
    }
  }
  publish = () => {
    if (this.timeout) clearTimeout(this.timeout);
    const { model, onPublish } = this.props;
    this.setState({ saveState: `Publishing...`, saveStateClass: styles.saving });
    return model.publish().then(result => {
      this.setState({ saveState: `Published!`, saveStateClass: styles.saved });
      return onPublish ? onPublish(result.instance) : null;
    }).catch(error => {
      this.setState({ saveState: error, saveStateClass: styles.error });
    });
  }
  renderNav() {
    return this.getFieldsets().map((fieldset, key) => {
      const { heading, validity, label } = fieldset.props;
      const className = this.state.activeTab === key ? styles.active : '';
      let isComplete = <span className={styles.tickNone}>+</span>;
      if (validity === true) isComplete = <span className={styles.tick}><img role="presentation" src="/images/tick.svg" /></span>;
      else if (validity === 'none') isComplete = null;
      return [heading ? <h1>{heading}</h1> : null, <a className={className} onClick={this.tabClick} key={key} data-key={key}>{label} {isComplete}</a>];
    });
  }
  renderTab() {
    return this.getFieldsets().map((child, key) => {
      const active = key === this.state.activeTab ? '' : styles.hiddenTab;
      return <div key={key} className={active}>{child}</div>;
    });
  }
  renderActionButtons() {
    const { inactive } = styles;
    const backAttr = {
      onClick: this.actionClick,
      onKeyPress: this.actionClick,
      className: styles.backButton,
      tabIndex: 0
    };
    const nextAttr = {
      onClick: this.actionClick,
      onKeyPress: this.actionClick,
      tabIndex: 0
    };
    let nextText = 'Next';
    if (this.state.activeTab === 0) {
      backAttr.className = `${styles.backButton} ${inactive}`;
      backAttr.onClick = undefined;
    } else if (this.state.activeTab + 1 === this.props.children.length) {
      nextAttr.onClick = this.publish;
      nextText = 'Publish';
    }
    return (<div className={styles.actionButtons}>
      <a {...backAttr}>Back</a>
      <a {...nextAttr}>{nextText}</a>
    </div>);
  }
  render() {
    const { pendingSteps } = this.props;
    return (<form onChange={this.props.autosave ? this.formChange : undefined} onFocus={this.onFocus} onBlur={this.onBlur} className={styles.form} data-hasFocus={this.state.hasFocus} ref="form">
      <nav className={styles.nav}>
        {this.renderNav()}
        <div className={styles.pending} dangerouslySetInnerHTML={{ __html: pendingSteps ? `Complete <b>${pendingSteps} more</b> step${pendingSteps === 1 ? '' : 's'} to finish your listing` : 'Ready to publish!' }} />
      </nav>
      <div className={styles.tabs}>
        <div className={`${styles.saveState} ${this.state.saveStateClass}`}>{this.state.saveState}</div>
        {this.renderTab()}
        <nav className={styles.formNav}>
          {this.renderActionButtons()}
        </nav>
      </div>
    </form>);
  }
}
