/*
 * Field
 */

import React from 'react';

export default class Field extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    name: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    type: React.PropTypes.string,
    value: React.PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value || '',
    };
  }
  render() {
    let type = this.props.type || 'text';
    let name = this.props.name;
    let input = <input type={type} name={name} value={this.value} />;
    if (type === 'textarea') {
      input = <textarea name={name} value={this.value} />;
    }
    return (
      <div className="component-field">
        <label>{this.props.label}</label>
        {input}
      </div>
    );
  }
}
