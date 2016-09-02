import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class MultiField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: PropTypes.array,
    onChange: PropTypes.func,
    options: PropTypes.array
  }
  handleChange = (event) => {
    const { value, checked } = event.target;
    let list = this.props.value || [];
    if (checked) {
      list.push(value);
    } else {
      list = list.filter(option => option !== value);
    }
    this.props.onChange(list);
  }
  render() {
    const { value, options } = this.props;
    return (<div className={styles.multiField}>
      {options.map(option => (<label className={styles.option} key={option}>
        <input type="checkbox" onChange={this.handleChange} value={option} checked={value ? (value.indexOf(option) + 1) : false} /> {option}
      </label>))}
    </div>);
  }
}
