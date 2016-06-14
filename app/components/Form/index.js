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
    this.formChange = this.formChange.bind(this);
    this.state = {
      activeTab: props.children[0].props.label,
    };
  }
  autosave() {
    console.log(this);
    const data = JSON.stringify(this.props.model);
    this.setState({ saveState: 'Saving...' });
    fetch('/api/session/' + this.props.model.id, {method: 'POST', body: data})
      .then((response) => response.json())
      .then((json) => {
        console.log('autosave complete', json);
        this.setState({ saveState: 'Saved!' });
      });
  }
  formChange() {
    if (!this.props.autosave) return;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(this.autosave, 4000);
    this.setState({ saveState: 'Changed' });
  }
  tabClick(event) {
    if (this.activeTab === event.target.text) return;
    this.setState({ activeTab: event.target.text });
  }
  renderTabs() {
    const self = this;
    return this.props.children.map((child, key) => {
      const className = self.state.activeTab === child.props.label ? styles.active : '';
      return <a className={className} onClick={this.tabClick} key={key}>{child.props.label}</a>;
    });
  }
  renderTab() {
    const self = this;
    return this.props.children.map((child, key) => {
      const active = child.props.label === self.state.activeTab ? '' : styles.hiddenTab;
      return <div key={key} className={active}>{child}</div>;
    });
  }
  render() {
    const submitText = this.props.submitText || 'Submit';
    return (
      <form onInput={this.formChange} className={styles.form}>
        <nav className={styles.nav}>
          {this.renderTabs()}
        </nav>
        <div className={styles.tabs}>
          <div className={styles.saveState}>{this.state.saveState}</div>
          {this.renderTab()}
          <input type="submit" value={submitText} />
        </div>
      </form>
    );
  }
}
