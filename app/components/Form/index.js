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
  constructor() {
    super();
    this.autosave = this.autosave.bind(this);
    this.tabClick = this.tabClick.bind(this);
    this.formChange = this.formChange.bind(this);
    this.state = {};
  }
  autosave() {
    console.log('fetch(/api/session/:sessionID/save, {method: POST, body: form.serialize()})');
  }
  formChange() {
    if (!this.props.autosave) return;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(this.autosave, 4000);
  }
  tabClick(event) {
    if (this.activeTab === event.target.text) return;
    this.setState({activeTab: event.target.text});
  }
  _renderTabs() {
    const self = this;
    return this.props.children.map((child) => {
      const className = self.state.activeTab == child.props.label ? styles.active : '';
      return <a className={className} onClick={this.tabClick}>{child.props.label}</a>;
    });
  }
  _renderTab() {
    const self = this;
    return this.props.children.map((child) => {
      const active = child.props.label === self.state.activeTab ? '' : styles.hiddenTab;
      return <div className={active}>{child}</div>;
    });
  }
  render() {
    const submitText = this.props.submitText || 'Submit';
    return (
      <form onInput={this.formChange} className={styles.form}>
        <nav className={styles.nav}>
          {this._renderTabs()}
        </nav>
        <div className={styles.tabs}>
          {this._renderTab()}
          <input type="submit" value={submitText} />
        </div>
      </form>
    );
  }
}
