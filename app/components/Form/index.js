/*
 * Form
 */

import React from 'react';

export default class Form extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    autosave: React.PropTypes.bool,
    children: React.PropTypes.node.isRequired,
    model: React.PropTypes.object,
    submitText: React.PropTypes.string,
  }
  constructor() {
    super();
    this.formChange = this.formChange.bind(this);
    this.autosave = this.autosave.bind(this);
  }
  autosave() {
    this.timeout = undefined;
    console.log('fetch(/api/session/:sessionID/save, {method: POST, body: form.serialize()})');
  }
  formChange() {
    if (!this.props.autosave) return;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(this.autosave, 4000);
  }
  _renderTabs() {
    this.props.children.forEach((child) => {
      console.log(child.props.label);
    });
    return <div></div>;
  }
  render() {
    const submitText = this.props.submitText || 'Submit';
    return (
      <form onInput={this.formChange}>
        {this._renderTabs()}
        {this.props.children}
        <input type="submit" value={submitText} />
      </form>
    );
  }
}
