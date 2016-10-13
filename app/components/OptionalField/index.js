import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class OptionalField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func,
    no: PropTypes.any,
    yes: PropTypes.any,
    null: PropTypes.string,
    component: PropTypes.object,
    multiline: PropTypes.bool
  }
  handleChange = event => {
    const { target } = event;
    const value = target ? target.value : event;
    this.props.onChange(value);
  }
  radioClick = event => {
    const showInput = event.target.value === 'true';
    if (!showInput) this.props.onChange(this.props.null || null);
    this.setState({ showInput });
  }
  render() {
    const { value, component, multiline } = this.props;
    let { showInput } = this.state || {};
    showInput = showInput || (!!value && value !== '0');
    const props = {
      className: styles.inputField,
      value: value ? value.toString() : '',
      onChange: this.handleChange
    };
    const input = showInput ? <component.type {...props} {...component.props} autoFocus /> : null;
    const radioAttrs = {
      type: 'radio',
      onChange: this.radioClick
    };
    return (<div className={`${styles.optionalField} ${multiline ? styles.multiline : ''}`}>
      <label>
        <input {...radioAttrs} value="null" checked={!showInput} /> {'no' in this.props ? this.props.no : 'No'}
      </label>
      <label>
        <input {...radioAttrs} value="true" checked={showInput} /> {'yes' in this.props ? this.props.yes : 'Yes'}
      </label>
      <label>
        {input}
      </label>
    </div>);
  }
}
