import React, { PropTypes } from 'react';
import BoolBox from '../BoolBox';

import styles from './styles.css';

export default class Checkbox extends React.PureComponent {
  static propTypes = {
    checked: PropTypes.bool,
    onChange: PropTypes.func,
    label: PropTypes.string
  }
  render() {
    const { checked, onChange, label } = this.props;
    return (<span className={styles.box}>
      <BoolBox checked={checked} onChange={value => onChange(value)} />
      <span onClick={() => onChange(!checked)} className={styles.label}>{label}</span>
    </span>);
  }
}
