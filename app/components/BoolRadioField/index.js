import React from 'react';

import styles from './styles.css';

export default class BoolRadioField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    onChange: React.PropTypes.func,
    value: React.PropTypes.any,
    options: React.PropTypes.array,
  }
  getValue() {
    return this.valueFromProps(this.props);
  }
  getOptions() {
    return this.props.options ? this.props.options : [{ text: 'No' }, { text: 'Yes' }];
  }
  parseProps() {
    return { value: this.getValue(), options: this.getOptions() };
  }
  valueFromProps(props) {
    return ('value' in props && props.value && props.value.toString) ? props.value.toString() : 'false';
  }
  handleChange = (event) => {
    const { value } = event.target;
    const state = { value };
    this.setState(state);
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }
  render() {
    const { value, options } = this.parseProps();
    const attrs = {
      onChange: this.handleChange,
      type: 'radio'
    };
    const parsedOptions = [{
      value: 'true',
      text: options[1].text
    }, {
      value: 'false',
      text: options[0].text
    }];
    const radios = (<ol>
      {parsedOptions.map((option) => {
        const checked = option.value === value;
        return (<li className={checked ? styles.selected : ''} key={option.value}>
          <label>
            <input value={option.value} checked={checked} {...attrs} />
            {option.text}
          </label>
        </li>);
      })}
    </ol>);
    return (<div className={styles.boolRadio}>
      {radios}
    </div>);
  }
}
