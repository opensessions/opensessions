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
    if (this.props.validation) {
      this.validate(value);
    }
  }
  validate(value) {
    const opts = this.props.validation;
    let valid = true;
    if (opts.maxLength) {
      if (value.length > opts.maxLength) {
        valid = false;
      }
    }
    this.setState({ valid });
  }
  validationHelper() {
    const opts = this.props.validation;
    if (!opts) return false;
    if (opts.maxLength) {
      return this.validationMaxLength();
    }
    return false;
  }
  validationMaxLength() {
    const opts = this.props.validation;
    const num = opts.maxLength - this.state.value.length;
    let urgency = styles.valid;
    if (num / opts.maxLength < .25) {
      urgency = styles.danger;
    } else if (num / opts.maxLength < .5) {
      urgency = styles.warn;
    }
    return <div className={styles.maxLength}><span className={urgency}>{num}</span> characters remaining</div>;
  }
  render() {
    let label = this.props.label;
    const validClass = this.state.valid === false ? styles.invalid : '';
    const attrs = {
      onChange: this.handleChange,
      className: `${styles.input} ${validClass}`,
    };
    attrs.name = this.props.name;
    attrs.value = this.state.value;
    if (this.props.model) {
      attrs.value = this.props.model[name];
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
      <div className={styles.field}>
        <label className={styles.label}>{label}</label>
        <div className={styles.inputWrap}>
          {input}
          {tip}
          {this.validationHelper()}
        </div>
      </div>
    );
  }
}
