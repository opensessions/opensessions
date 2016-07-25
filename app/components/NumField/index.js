import React from 'react';

import styles from './styles.css';

export default class NumField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    name: React.PropTypes.string.isRequired,
    model: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func,
    validation: React.PropTypes.object,
    className: React.PropTypes.string,
    autoFocus: React.PropTypes.bool,
    format: React.PropTypes.string,
    step: React.PropTypes.string
  }
  handleChange = (event) => {
    const { value } = event.target;
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }
  render() {
    const { name, className, autoFocus, model, validation, format, step } = this.props;
    const attrs = {
      className,
      type: 'number',
      name,
      value: model[name],
      onChange: this.handleChange,
      autoFocus,
      step
    };
    if (validation) {
      ['min', 'max'].forEach((rule) => {
        if (rule in validation) attrs[rule] = validation[rule];
      });
    }
    let prepend;
    let append;
    if (format) {
      [prepend, append] = format.split(':');
    }
    const numberInput = <input {...attrs} />;
    return (<div className={styles.numField}>
      <label>
        {prepend}{numberInput}{append}
      </label>
    </div>);
  }
}
