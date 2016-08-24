import React from 'react';

import styles from './styles.css';

export default class MultiField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: React.PropTypes.array,
    onChange: React.PropTypes.func,
    options: React.PropTypes.array
  }
  handleChange = (event) => {
    const { value, checked } = event.target;
    let list = this.props.value || [];
    if (checked) {
      list.push(value);
    } else {
      list = list.filter(option => option !== value);
    }
    if (this.props.onChange) this.props.onChange(list);
  }
  render() {
    const { value, options } = this.props;
    return (<div className={styles.multiField}>
      {options.map(option => (<label className={styles.option}>
        <input type="checkbox" onChange={this.handleChange} value={option} checked={value ? (value.indexOf(option) + 1) : false} /> {option}
      </label>))}
    </div>);
  }
}
