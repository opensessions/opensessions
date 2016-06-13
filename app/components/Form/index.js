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
    console.log('fetch(/api/session/:sessionID/save, {method: POST, body: form.serialize()})');
    this.timeout = undefined;
  }
  formChange() {
    if (!this.props.autosave) return;
    if( this.timeout ) clearTimeout(this.timeout);
    this.timeout = setTimeout(this.autosave, 4000);
  }
  render() {
    const submitText = this.props.submitText || 'Submit';
    return (
      <form onInput={this.formChange}>
        {this.props.children}
        <input type="submit" value={submitText} />
      </form>
    );
  }
}
