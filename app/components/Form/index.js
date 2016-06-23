/*
 * Form
 */

import React from 'react';

import styles from './styles.css';

export default class Form extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    autosave: React.PropTypes.bool,
    children: React.PropTypes.node.isRequired,
    model: React.PropTypes.object,
    submitText: React.PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.autosave = this.autosave.bind(this);
    this.tabClick = this.tabClick.bind(this);
    this.actionClick = this.actionClick.bind(this);
    this.formChange = this.formChange.bind(this);
    this.submit = this.submit.bind(this);
    this.state = {
      activeTab: 0,
      saveState: 'Unsaved',
      saveStateClass: styles.unsaved,
    };
  }
  autosave() {
    const model = this.props.model;
    model.isPublished = false;
    this.saveModel(model);
  }
  saveModel(model) {
    const data = JSON.stringify(model);
    this.setState({ saveState: 'Saving...', saveStateClass: styles.saving });
    fetch(`/api/session/${model.uuid}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: data,
      credentials: 'same-origin',
    }).then((response) => response.json())
      .then((json) => {
        console.log('save complete', json);
        this.setState({ saveState: 'Saved!', saveStateClass: styles.saved });
      });
  }
  formChange() {
    if (!this.props.autosave) return;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(this.autosave, 2000);
    this.setState({ saveState: 'Saving...', saveStateClass: styles.saving });
  }
  tabClick(event) {
    const key = Array.prototype.indexOf.call(event.target.parentNode.childNodes, event.target);
    if (this.state.activeTab === key) return;
    this.setState({ activeTab: key });
  }
  actionClick(event) {
    const delta = event.target.text === 'Next' ? 1 : -1;
    this.setState({ activeTab: this.state.activeTab + delta });
  }
  submit() {
    const model = this.props.model;
    model.isPublished = true;
    this.saveModel(model);
    console.log(this);
  }
  renderNav() {
    const self = this;
    return this.props.children.map((fieldset, key) => {
      const className = self.state.activeTab === key ? styles.active : '';
      let isComplete;
      if (fieldset.props.validity) {
        isComplete = <span className={styles.tick}>&#10003;</span>;
      }
      return <a className={className} onClick={this.tabClick} index={key}>{fieldset.props.label} {isComplete}</a>;
    });
  }
  renderTab() {
    const self = this;
    return this.props.children.map((child, key) => {
      const active = key === self.state.activeTab ? '' : styles.hiddenTab;
      return <div key={key} className={active}>{child}</div>;
    });
  }
  renderActionButtons() {
    const inactive = styles.inactive;
    const backAttr = {
      onClick: this.actionClick,
      className: styles.backButton,
    };
    const nextAttr = {
      onClick: this.actionClick,
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
      <form onInput={this.formChange} className={styles.form}>
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
