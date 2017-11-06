import React, { PropTypes } from 'react';

import Checkbox from '../Checkbox';

import styles from './styles.css';

export default class MultiBoolField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: PropTypes.array,
    onChange: PropTypes.func,
    options: PropTypes.array
  }
  handleChange = (value, checked) => {
    const list = this.props.value || [];
    this.props.onChange(checked ? list.concat(value) : list.filter(option => option !== value));
  }
  render() {
    const { value, options } = this.props;
    return (<div className={styles.multiField}>
      {options.map(option => (<label className={styles.option} key={option}>
        <Checkbox label={option} checked={value ? !!(value.indexOf(option) + 1) : false} onChange={checked => this.handleChange(option, checked)} />
      </label>))}
    </div>);
  }
}
