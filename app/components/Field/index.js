import React from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
require('react-datepicker/dist/react-datepicker.css');

import BoolRadioField from 'components/BoolRadioField';
import IconRadioField from 'components/IconRadioField';
import RelationField from 'components/RelationField';
import OptionalField from 'components/OptionalField';
import LocationField from 'components/LocationField';
import TimePicker from 'components/TimePicker';

import styles from './styles.css';

export default class Field extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    label: React.PropTypes.string,
    tip: React.PropTypes.string,
    tipTitle: React.PropTypes.string,
    example: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    model: React.PropTypes.object.isRequired,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func,
    type: React.PropTypes.string,
    validation: React.PropTypes.object,
    options: React.PropTypes.array
  }
  constructor(props) {
    super(props);
    this.state = {
      valid: true,
      hasFocus: false,
      isMobile: navigator.userAgent.match(/(android|iphone)/i) !== null
    };
  }
  onFocusChange = (event) => {
    this.setState({ hasFocus: event.type === 'focus' });
  }
  handleValueChangeByName = (name, value) => {
    const valid = this.isValid(value);
    this.setState({ valid });
    if (this.props.onChange) this.props.onChange(value);
    this.props.model.update(name, value);
  }
  handleValueChange = (value) => {
    this.handleValueChangeByName(this.props.name, value);
  }
  handleDateChange = (date) => {
    const value = date.toISOString().substr(0, 10);
    this.handleValueChange(value);
  }
  handleChange = (event) => {
    const { value } = event.target;
    this.handleValueChange(value);
  }
  isValid(value) {
    const { opts } = this.props.validation;
    let valid = true;
    if (opts) {
      if (opts.maxLength) {
        if (value.length > opts.maxLength) {
          valid = false;
        }
      } else if (value.length === 0) {
        valid = false;
      }
    }
    return valid;
  }
  renderValidationMaxLength() {
    const maxLength = this.props.validation.maxLength;
    const text = this.props.model[this.props.name] || '';
    let num = maxLength - text.length;
    let urgency = styles.valid;
    let characterState = 'remaining';
    if (num / maxLength < .1) {
      urgency = styles.danger;
    } else if (num / maxLength < .2) {
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
  render() {
    const { label, placeholder, validation, model, name, tip, tipTitle, example } = this.props;
    const { valid, isMobile } = this.state;
    const attrs = {
      name,
      placeholder,
      value: '',
      onChange: this.handleValueChange,
      className: `${styles.input} ${valid ? '' : styles.invalid}`,
    };
    if (model && name in model && model[name]) attrs.value = model[name];
    let input;
    const type = this.props.type || 'text';
    if (type === 'IconRadio') {
      input = <IconRadioField options={this.props.options} {...attrs} />;
    } else if (type === 'BoolRadio') {
      attrs.falseText = this.props.options[0].text;
      attrs.trueText = this.props.options[1].text;
      input = <BoolRadioField options={this.props.options} {...attrs} />;
    } else if (type === 'Relation') {
      input = <RelationField {...this.props} {...attrs} />;
    } else if (type === 'Optional') {
      if (validation) attrs.validation = validation;
      input = <OptionalField {...this.props} {...attrs} />;
    } else if (type === 'Location') {
      delete attrs.onChange;
      attrs.onValueChangeByName = this.handleValueChangeByName;
      input = <LocationField {...this.props} {...attrs} />;
    } else if (type === 'date') {
      if (isMobile) {
        attrs.type = 'date';
        if (attrs.value) attrs.value = (new Date(attrs.value)).toISOString().substr(0, 10);
        attrs.onChange = (event) => {
          const { value } = event.target;
          this.handleDateChange(new Date(value));
        };
        input = <input {...attrs} />;
      } else {
        const now = moment(Date.now());
        const value = attrs.value ? moment(attrs.value) : now;
        const dateAttrs = { selected: value, onChange: this.handleDateChange, minDate: now };
        input = <DatePicker {...dateAttrs} />;
      }
    } else if (type === 'time') {
      if (isMobile) {
        attrs.type = 'time';
        attrs.onChange = this.handleChange;
        input = <input {...attrs} />;
      } else {
        input = <TimePicker {...attrs} />;
      }
    } else {
      attrs.onChange = this.handleChange;
      if (type === 'textarea') {
        if (validation && validation.maxLength > 100) {
          attrs.className = `${attrs.className} ${styles.longText}`;
        }
      } else if (type === 'number') {
        if (validation) {
          ['min', 'max'].forEach((prop) => {
            if (prop in validation) {
              attrs[prop] = validation[prop];
            }
          });
        }
      }
      attrs.type = type;
      input = type === 'textarea' ? <textarea {...attrs} /> : <input {...attrs} />;
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
      <div className={styles.inputWrap}>
        {input}
        {this.renderValidation()}
      </div>
      {tooltip}
    </div>);
  }
}
