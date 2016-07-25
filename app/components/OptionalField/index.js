import React from 'react';

import styles from './styles.css';

export default class OptionalField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func,
    model: React.PropTypes.object,
    no: React.PropTypes.any,
    yes: React.PropTypes.any,
    null: React.PropTypes.string,
    component: React.PropTypes.object,
    multiline: React.PropTypes.bool
  }
  constructor() {
    super();
    this.state = { showInput: false, clean: true };
  }
  componentWillReceiveProps(nextProps) {
    const model = nextProps.model || this.props.model;
    const name = nextProps.name || this.props.name;
    if (this.state.clean && name in model) this.setState({ showInput: !!model[name] });
  }
  handleChange = (event) => {
    const { target } = event;
    const value = target ? target.value : event;
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }
  radioClick = (event) => {
    const showInput = event.target.value === 'true';
    this.setState({ showInput, clean: false });
    if (this.props.onChange && !showInput) {
      this.props.onChange(this.props.null || null);
    }
  }
  render() {
    const { name, model, component, multiline } = this.props;
    const { showInput } = this.state;
    const attrs = {
      className: styles.inputField,
      name,
      model,
      onChange: this.handleChange
    };
    const input = showInput ? <component.type {...attrs} {...component.props} autoFocus /> : null;
    const radioAttrs = {
      id: `${name}_optionalNumField`,
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
