import React from 'react';

import styles from './styles.css';

import { apiFetch } from '../../utils/api';

export default class Form extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    autosave: React.PropTypes.bool,
    autosaveEvent: React.PropTypes.func,
    children: React.PropTypes.node.isRequired,
    model: React.PropTypes.object,
    pendingSteps: React.PropTypes.any,
    onPublish: React.PropTypes.func,
    onChange: React.PropTypes.func,
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
    return apiFetch(`/api/session/${model.uuid}`, { body: model }).then((result) => {
      if (result.error) {
        throw result.error;
      }
      if (this.props.autosaveEvent) this.props.autosaveEvent({ type: 'saved', state: result.instance.state });
      this.setState({ saveState: `${verbed} ${model.state === 'published' ? 'and published' : 'as draft'}!`, saveStateClass: styles.saved });
      return result;
    });
  }
  formChange = () => {
    this.autosave(2000);
    if (this.props.onChange) this.props.onChange(this.props.model);
  }
  tabClick = (event) => {
    const key = Array.prototype.indexOf.call(event.target.parentNode.childNodes, event.target);
    this.setState({ activeTab: key });
  }
  actionClick = (event) => {
    const delta = event.target.text === 'Next' ? 1 : -1;
    this.setState({ activeTab: this.state.activeTab + delta });
  }
  submit = () => {
    if (this.timeout) clearTimeout(this.timeout);
    const { model, onPublish } = this.props;
    model.state = 'published';
    this.saveModel(model, 'Publishing', 'Published')
      .then((result) => (onPublish ? onPublish(result.instance) : null))
      .catch((error) => this.setState({ saveState: error, saveStateClass: styles.error }));
  }
  renderNav() {
    return this.getFieldsets().map((fieldset, key) => {
      const className = this.state.activeTab === key ? styles.active : '';
      let isComplete = <span className={styles.tickNone}>+</span>;
      if (fieldset.props.validity === true) {
        isComplete = <span className={styles.tick}>&#10003;</span>;
      } else if (fieldset.props.validity === 'none') {
        isComplete = null;
      }
      return <a className={className} onClick={this.tabClick} key={key}>{fieldset.props.label} {isComplete}</a>;
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
      className: styles.backButton,
      tabIndex: 0
    };
    const nextAttr = {
      onClick: this.actionClick,
      tabIndex: 0
    };
    let nextText = 'Next';
    if (this.state.activeTab === 0) {
      backAttr.className = `${styles.backButton} ${inactive}`;
      backAttr.onClick = undefined;
    } else if (this.state.activeTab + 1 === this.props.children.length) {
      nextAttr.onClick = this.submit;
      nextText = 'Publish';
    }
    return (<div className={styles.actionButtons}>
      <a {...backAttr}>Back</a>
      <a {...nextAttr}>{nextText}</a>
    </div>);
  }
  render() {
    const { pendingSteps } = this.props;
    return (<form onChange={this.props.autosave ? this.formChange : undefined} onFocus={this.onFocus} onBlur={this.onBlur} className={styles.form} data-hasFocus={this.state.hasFocus}>
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
