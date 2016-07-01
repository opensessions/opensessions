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
    };
    this.handleChange = this.handleChange.bind(this);
    this.radioChange = this.radioChange.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value,
      bool: nextProps.value ? true : false // eslint-disable-line no-unneeded-ternary
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
    const bool = event.target.value === 'true';
    if (!bool) {
      this.handleChange(event);
    }
    this.setState({ bool });
  }
  render() {
    const id = this.props.id || this.props.name;
    const attrs = {
      onChange: this.handleChange,
      name: this.props.name,
      type: 'number',
      value: this.state.value
    };
    let numberInput = null;
    if (this.state.bool) {
      numberInput = <input className={styles.inputField} {...attrs} autoFocus />;
    }
    return (<div className={styles.boolRadio}>
      <label>
        <input type="radio" name={`_${id}`} value="false" selected={this.state.bool === false} onChange={this.radioChange} /> No
      </label>
      <label>
        <input type="radio" name={`_${id}`} value="true" selected={this.state.bool} onChange={this.radioChange} /> Yes
      </label>
      <label>
        {numberInput}
      </label>
    </div>);
  }
}
