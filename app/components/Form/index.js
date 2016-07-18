import React from 'react';

import styles from './styles.css';

import { apiFetch } from '../../utils/api';

export default class Form extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    autosave: React.PropTypes.bool,
    children: React.PropTypes.node.isRequired,
    model: React.PropTypes.object,
    onPublish: React.PropTypes.func,
    onChange: React.PropTypes.func,
  }
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 0,
      saveState: 'Unsaved',
      saveStateClass: styles.unsaved,
    };
  }
  getFieldsets() {
    return this.props.children instanceof Array ? this.props.children : [this.props.children];
  }
  autosave = () => {
    const { model } = this.props;
    if (model.state !== 'unpublished') {
      model.state = 'draft';
    }
    this.saveModel(model);
  }
  saveModel(model, verb, verbed) {
    this.setState({ saveState: `${verb || 'Saving'}...`, saveStateClass: styles.saving });
    return apiFetch(`/api/session/${model.uuid}`, { body: model }).then((result) => {
      if (result.error) {
        throw result.error;
      }
      this.setState({ saveState: `${verbed || 'Saved'} ${model.state ? model.state : ''}!`, saveStateClass: styles.saved });
      return result;
    });
  }
  formChange = (event) => {
    if (!event.target.name) return;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(this.autosave, 2000);
    this.setState({ saveState: 'Saving...', saveStateClass: styles.saving });
    if (this.props.onChange) this.props.onChange(this.props.model);
  }
  tabClick = (event) => {
    const key = Array.prototype.indexOf.call(event.target.parentNode.childNodes, event.target);
    if (this.state.activeTab === key) return;
    this.setState({ activeTab: key });
  }
  actionClick = (event) => {
    const delta = event.target.text === 'Next' ? 1 : -1;
    this.setState({ activeTab: this.state.activeTab + delta });
  }
  submit = () => {
    if (this.timeout) clearTimeout(this.timeout);
    const { model } = this.props;
    model.state = 'published';
    this.saveModel(model, 'Publishing', 'Published').then((result) => {
      if (this.props.onPublish) {
        this.props.onPublish(result.instance);
      }
    }).catch((error) => {
      this.setState({ saveState: error, saveStateClass: styles.error });
    });
  }
  renderNav() {
    const self = this;
    return this.getFieldsets().map((fieldset, key) => {
      const className = self.state.activeTab === key ? styles.active : '';
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
    const self = this;
    return this.getFieldsets().map((child, key) => {
      const active = key === self.state.activeTab ? '' : styles.hiddenTab;
      return <div key={key} className={active}>{child}</div>;
    });
  }
  renderActionButtons() {
    const inactive = styles.inactive;
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
    return (
      <form onChange={this.props.autosave ? this.formChange : undefined} className={styles.form}>
        <nav className={styles.nav}>
          {this.renderNav()}
        </nav>
        <div className={styles.tabs}>
          <div className={`${styles.saveState} ${this.state.saveStateClass}`}>{this.state.saveState}</div>
          {this.renderTab()}
          <nav className={styles.formNav}>
            {this.renderActionButtons()}
          </nav>
        </div>
      </form>
    );
  }
}
