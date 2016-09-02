import React from 'react';

import styles from './styles.css';

export default class OptionalField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: React.PropTypes.any,
    onChange: React.PropTypes.func,
    no: React.PropTypes.any,
    yes: React.PropTypes.any,
    null: React.PropTypes.string,
    component: React.PropTypes.object,
    multiline: React.PropTypes.bool
  }
  constructor() {
    super();
    this.state = { showInput: false };
  }
  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;
    if (!this.state.showInput && this.props.value != value) this.setState({ showInput: !!value && value !== '0' }); // eslint-disable-line eqeqeq
  }
  handleChange = event => {
    const { target } = event;
    const value = target ? target.value : event;
    if (this.props.onChange) this.props.onChange(value);
  }
  radioClick = event => {
    const showInput = event.target.value === 'true';
    if (!showInput) this.props.onChange(this.props.null || null);
    this.setState({ showInput });
  }
  render() {
    const { value, component, multiline } = this.props;
    const { showInput } = this.state;
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
