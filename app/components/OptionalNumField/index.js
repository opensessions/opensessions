import React from 'react';

import styles from './styles.css';

export default class OptionalNumField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    name: React.PropTypes.string.isRequired,
    id: React.PropTypes.string,
    onChange: React.PropTypes.func,
    value: React.PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || '',
      bool: props.value ? true : false, // eslint-disable-line no-unneeded-ternary
      checkVal: props.value ? 'true' : 'false' // eslint-disable-line no-unneeded-ternary
    };
    this.handleChange = this.handleChange.bind(this);
    this.radioChange = this.radioChange.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value,
      bool: nextProps.value ? true : false, // eslint-disable-line no-unneeded-ternary
      checkVal: nextProps.value ? 'true' : 'false' // eslint-disable-line no-unneeded-ternary
    });
  }
  handleChange(event) {
    const value = event.target.value;
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  }
  radioChange(event) {
    const bool = event.target.value !== 'false';
    this.setState({ bool, checkVal: event.target.value });
  }
  render() {
    const id = this.props.id || this.props.name;
    const attrs = {
      className: styles.inputField,
      type: 'number',
      name: this.props.name,
      value: this.state.value,
      onChange: this.handleChange
    };
    let numberInput = null;
    if (this.state.bool) {
      numberInput = <input {...attrs} autoFocus />;
    }
    const radioAttrs = {
      type: 'radio',
      name: `_${id}`,
      onChange: this.radioChange
    };
    const yesIsChecked = this.state.checkVal === 'true';
    return (<div className={styles.optionalNum}>
      <label>
        <input {...radioAttrs} value="false" checked={!yesIsChecked} /> No
      </label>
      <label>
        <input {...radioAttrs} value="true" checked={yesIsChecked} /> Yes
      </label>
      <label>
        {numberInput}
      </label>
    </div>);
  }
}
