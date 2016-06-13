/*
 * Field
 */

import React from 'react';

import styles from './styles.css';

export default class Field extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    label: React.PropTypes.string.isRequired,
    model: React.PropTypes.object,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func,
    type: React.PropTypes.string,
    value: React.PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value || '',
    };
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(event) {
    const value = event.target.value;
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange(event);
    }
    if (this.props.model) {
      this.props.model.update(this.props.name, value);
    }
  }
  render() {
    let label = this.props.label;
    let type = this.props.type || 'text';
    let name = this.props.name;
    let value = this.state.value;
    if (this.props.model) {
      value = this.props.model[name];
    }
    let input;
    if (type === 'textarea') {
      input = <textarea name={name} value={value} onChange={this.handleChange} className={styles.input} />;
    } else {
      input = <input type={type} name={name} value={value} onChange={this.handleChange} className={styles.input} />;
    }
    return (
      <div className={styles.field}>
        <label className={styles.label}>{label}</label>
        {input}
      </div>
    );
  }
}
