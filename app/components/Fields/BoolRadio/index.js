import React, { PropTypes } from 'react';
import BoolBox from '../BoolBox';

import styles from './styles.css';

export default class BoolRadio extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.any,
    options: PropTypes.array,
  }
  parseProps() {
    return {
      value: `${this.props.value || false}`,
      options: this.props.options || [{ text: 'No' }, { text: 'Yes' }],
      onChange: this.props.onChange
    };
  }
  render() {
    const { onChange, value, options } = this.parseProps();
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
          <BoolBox checked={checked} onChange={() => onChange(option.value)} type="radio" /> <label onClick={() => onChange(option.value)}>{option.text}</label>
        </li>);
      })}
    </ol>);
    return (<div className={styles.boolRadio}>
      {radios}
    </div>);
  }
}
