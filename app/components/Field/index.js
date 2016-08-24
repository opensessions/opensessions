import React, { PropTypes } from 'react';

import DateField from 'components/DateField';
import TimeField from 'components/TimeField';

import styles from './styles.css';

export default class Field extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    label: PropTypes.string,
    tip: PropTypes.string,
    tipTitle: PropTypes.string,
    example: PropTypes.string,
    placeholder: PropTypes.string,
    fullSize: PropTypes.bool,
    value: PropTypes.func,
    onChange: PropTypes.func,
    type: PropTypes.string,
    validation: PropTypes.object,
    props: PropTypes.object,
    element: PropTypes.node
  };
  constructor(props) {
    super(props);
    this.state = {
      valid: true,
      hasFocus: false
    };
  }
  onFocusChange = (event) => {
    this.setState({ hasFocus: event.type === 'focus' });
  }
  render() {
    const { label, placeholder, validation, fullSize, tip, tipTitle, value, example, props, element } = this.props;
    const attrs = {
      placeholder,
      value,
      onChange: this.handleValueChange,
      onValueChangeByName: this.handleValueChangeByName,
      className: styles.input,
    };
    let input;
    attrs.type = this.props.type || 'text';
    if (validation) attrs.validation = validation;
    if (element) {
      input = element;
    } else if (attrs.type === 'date') {
      input = <DateField {...this.props} />;
    } else if (attrs.type === 'time') {
      input = <TimeField {...this.props} />;
    } else {
      attrs.onChange = this.handleChange;
      if (attrs.type === 'textarea') {
        if (validation && validation.maxLength > 100) {
          attrs.className = `${attrs.className} ${styles.longText}`;
        } else if (props && props.size === 'XL') {
          attrs.className = `${attrs.className} ${styles.xLongText}`;
        }
        input = <textarea {...attrs} />;
      } else if (attrs.type === 'number') {
        if (validation) {
          ['min', 'max'].filter(prop => prop in validation).forEach(prop => {
            attrs[prop] = validation[prop];
          });
        }
        input = <input {...attrs} />;
      } else {
        input = <input {...attrs} />;
      }
    }
    let tooltip;
    if (tip) {
      tooltip = (<div className={styles.tip}>
        <strong>{tipTitle || label}</strong>
        <p>{tip}</p>
        {example ? <p className={styles.example}>{example}</p> : null}
      </div>);
    }
    return (<div className={styles.field} data-valid={this.state.valid} data-hasfocus={this.state.hasFocus} onFocus={this.onFocusChange} onBlur={this.onFocusChange}>
      <label className={styles.label}>{label}</label>
      <div className={(attrs.type === 'MultiField' || fullSize) ? '' : styles.inputWrap}>
        {input}
      </div>
      {tooltip}
    </div>);
  }
}
