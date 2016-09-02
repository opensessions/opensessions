import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class TextField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    validation: PropTypes.object,
    autoFocus: PropTypes.bool,
    multi: PropTypes.bool,
    size: PropTypes.string,
  }
  handleChange = event => {
    const { target } = event;
    const { onChange, validation } = this.props;
    let { value } = target;
    if (validation && validation.maxLength) value = value.substr(0, validation.maxLength);
    onChange(value);
  }
  renderValidation() {
    const opts = this.props.validation;
    if (!opts) return false;
    if (opts.maxLength) {
      return this.renderValidationMaxLength();
    }
    return false;
  }
  renderValidationMaxLength() {
    const { validation, value } = this.props;
    const { maxLength } = validation;
    let num = maxLength - (value || '').length;
    let urgency = styles.valid;
    let characterState = 'remaining';
    if (num / maxLength < .1) {
      urgency = styles.danger;
    } else if (num / maxLength < .2) {
      urgency = styles.warn;
    }
    if (num < 0) {
      num = -num;
      characterState = 'too many';
    }
    const characters = num === 1 ? 'character' : 'characters';
    return <div className={styles.maxLength}><span className={urgency}>{num}</span> {characters} {characterState}</div>;
  }
  render() {
    const { value, className, placeholder, multi, size, validation, autoFocus } = this.props;
    const attrs = {
      value: value || '',
      onChange: this.handleChange,
      placeholder,
      className,
      autoFocus
    };
    let input;
    if (multi) {
      if (validation && validation.maxLength > 100) {
        attrs.className = [attrs.className, styles.longText].join(' ');
      } else if (size === 'XL') {
        attrs.className = [attrs.className, styles.xLongText].join(' ');
      }
      input = <textarea {...attrs} />;
    } else {
      input = <input type="text" {...attrs} />;
    }
    return (<div>
      {input}
      {this.renderValidation()}
    </div>);
  }
}
