import React from 'react';

import BoolRadioField from 'components/BoolRadioField';
import IconRadioField from 'components/IconRadioField';
import RelationField from 'components/RelationField';
import OptionalNumField from 'components/OptionalNumField';
import LocationField from 'components/LocationField';

import styles from './styles.css';

export default class Field extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    label: React.PropTypes.string.isRequired,
    model: React.PropTypes.object.isRequired,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func,
    tip: React.PropTypes.string,
    type: React.PropTypes.string,
    validation: React.PropTypes.object,
    value: React.PropTypes.string,
    options: React.PropTypes.array
  }
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || '',
      valid: true,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value || ''
    });
  }
  handleValueChange(value) {
    const newState = { value };
    if (this.props.validation) {
      newState.valid = this.isValid(value);
    }
    this.setState(newState);
    if (this.props.onChange) {
      this.props.onChange(value);
    }
    if (this.props.model) {
      this.props.model.update(this.props.name, value);
    }
  }
  handleChange(event) {
    const value = event.target.value;
    this.handleValueChange(value);
  }
  isValid(value) {
    if (typeof value === 'undefined') value = this.state.value;
    const opts = this.props.validation || '';
    let valid = true;
    if (opts.maxLength) {
      if (value.length > opts.maxLength) {
        valid = false;
      }
    } else if (value.length === 0) {
      valid = false;
    }
    this.setState({ valid });
    return valid;
  }
  renderValidationMaxLength() {
    const maxLength = this.props.validation.maxLength;
    const text = this.state.value || this.props.model[this.props.name] || '';
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
    const { label, validation } = this.props;
    const attrs = {
      name: this.props.name,
      validation,
      onChange: this.handleChange,
      className: `${styles.input} ${this.state.valid ? '' : styles.invalid}`
    };
    if (this.props.model) {
      attrs.value = this.props.model.hasOwnProperty(attrs.name) ? this.props.model[attrs.name] : '';
    } else {
      attrs.value = this.state.value;
    }
    let input;
    const type = this.props.type || 'text';
    if (type === 'textarea') {
      if (validation && validation.maxLength > 100) {
        attrs.className = `${attrs.className} ${styles.longText}`;
      }
      input = <textarea {...attrs} />;
    } else if (type === 'IconRadio') {
      input = <IconRadioField options={this.props.options} {...attrs} />;
    } else if (type === 'BoolRadio') {
      attrs.falseText = this.props.options[0].text;
      attrs.trueText = this.props.options[1].text;
      input = <BoolRadioField options={this.props.options} {...attrs} />;
    } else if (type === 'Relation') {
      attrs.inputStyle = styles.input;
      input = <RelationField {...this.props} {...attrs} />;
    } else if (type === 'OptionalNum') {
      attrs.onChange = this.handleValueChange;
      input = <OptionalNumField {...attrs} />;
    } else if (type === 'Location') {
      attrs.inputStyle = styles.input;
      delete attrs.onChange;
      input = <LocationField {...this.props} {...attrs} />;
    } else {
      if (type === 'date') {
        const date = new Date(attrs.value);
        attrs.value = date.toLocaleDateString()
          .split('/')
          .reverse()
          .join('-');
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
      input = <input {...attrs} />;
    }
    let tip;
    if (this.props.tip) {
      tip = (<div className={styles.tip}>
        <strong>{label}</strong>
        <p>{this.props.tip}</p>
      </div>);
    }
    return (<div className={styles.field} data-valid={this.state.valid}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputWrap}>
        {input}
        {tip}
        {this.renderValidation()}
      </div>
    </div>);
  }
}
