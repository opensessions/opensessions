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
    tip: React.PropTypes.string,
    type: React.PropTypes.string,
    validation: React.PropTypes.object,
    value: React.PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || '',
      valid: undefined,
      error: false,
    };
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(event) {
    const value = event.target.value;
    const state = { value };
    if (this.props.validation) {
      state.valid = this.isValid(value);
    }
    this.setState(state);
    if (this.props.onChange) {
      this.props.onChange(event);
    }
    if (this.props.model) {
      this.props.model.update(this.props.name, value);
    }
  }
  isValid(value) {
    if (typeof value === 'undefined') value = this.state.value;
    const opts = this.props.validation;
    let valid = true;
    if (opts.maxLength) {
      if (value.length > opts.maxLength) {
        valid = false;
      }
    }
    return valid;
  }
  renderValidationMaxLength() {
    const maxLength = this.props.validation.maxLength;
    let num = maxLength - this.state.value.length;
    let urgency = styles.valid;
    let characterState = 'remaining';
    if (num / maxLength < .25) {
      urgency = styles.danger;
    } else if (num / maxLength < .5) {
      urgency = styles.warn;
    }
    if (num < 0) {
      num = 0 - num;
      characterState = 'too many';
    }
    const characters = num === 1 ? 'character' : 'characters';
    return <div className={styles.maxLength}><span className={urgency}>{num}</span> {characters} {characterState}</div>;
  }
  renderValidation() {
    const opts = this.props.validation;
    if (!opts) return false;
    if (opts.maxLength) {
      return this.renderValidationMaxLength();
    }
    return false;
  }
  error(value) {
    if (value == "") {
      this.setState({ error: true })
    } else {
      this.setState({ error: false })
    }
  }
  render() {
    let label = this.props.label;
    const validClass = this.state.valid === false ? styles.invalid : '';
    const errorCheck = this.state.error === true ? styles.invalid : '';
    const attrs = {
      onChange: this.handleChange,
      className: `${styles.input} ${validClass} ${errorCheck}`,
      name: this.props.name,
      value: this.state.value,
      id: this.props.id || this.props.name,
    };
    if (this.props.model) {
      attrs.value = this.props.model[this.props.name];
    }
    let input;
    if (this.props.type === 'textarea') {
      input = <textarea {...attrs} />;
    } else {
      attrs.type = this.props.type || 'text';
      input = <input {...attrs} />;
    }
    let tip;
    if (this.props.tip) {
      tip = (<div className={styles.tip}>
        <strong>{label}</strong>
        <p>{this.props.tip}</p>
      </div>);
    }
    return (
      <div className={styles.field} data-valid={this.state.valid}>
        <label className={styles.label}>{label}</label>
        <div className={styles.inputWrap}>
          {input}
          {tip}
          {this.renderValidation()}
        </div>
      </div>
    );
  }
}
