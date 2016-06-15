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
    this.state = {
      activeTab: 0,
      saveState: 'Unsaved',
      saveStateClass: styles.unsaved,
    };
  }
  autosave() {
    const data = JSON.stringify(this.props.model);
    this.setState({ saveState: 'Saving...', saveStateClass: styles.saving });
    fetch(`/api/session/ ${this.props.model.id}`, { method: 'POST', body: data })
      .then((response) => response.json())
      .then((json) => {
        console.log('autosave complete', json);
        this.setState({ saveState: 'Saved!', saveStateClass: styles.saved });
      });
  }
  formChange() {
    if (!this.props.autosave) return;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(this.autosave, 3000);
    this.setState({ saveState: 'Changed', saveStateClass: styles.changed });
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
  renderNav() {
    const self = this;
    return this.props.children.map((child, key) => {
      const className = self.state.activeTab === key ? styles.active : '';
      const isComplete = <span className={styles.tick}>&#10003;</span>;
      return <a className={className} onClick={this.tabClick} index={key}>{child.props.label} {isComplete}</a>;
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
    };
    const nextAttr = {
      onClick: this.actionClick,
    };
    if (this.state.activeTab === 0) {
      backAttr.className = inactive;
      backAttr.onClick = undefined;
    } else if (this.state.activeTab + 1 === this.props.children.length) {
      nextAttr.className = inactive;
      nextAttr.onClick = undefined;
    }
    return (<div className={styles.actionButtons}>
      <a {...backAttr}>Back</a>
      <a {...nextAttr}>Next</a>
    </div>);
  }
  render() {
    const submitText = this.props.submitText || 'Submit';
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
            <input type="submit" value={submitText} />
          </nav>
        </div>
      </form>
    );
  }
}
