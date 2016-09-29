import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class BoolRadioField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.any,
    options: PropTypes.array,
  }
  parseProps() {
    return {
      value: `${this.props.value || false}`,
      options: this.props.options || [{ text: 'No' }, { text: 'Yes' }]
    };
  }
  handleChange = event => {
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
      {parsedOptions.map(option => {
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
