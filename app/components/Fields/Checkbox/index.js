import React, { PropTypes } from 'react';

import TickSVG from '../../SVGs/Tick';

import styles from './styles.css';

export default class Checkbox extends React.PureComponent {
  static propTypes = {
    checked: PropTypes.bool,
    onChange: PropTypes.func,
    label: PropTypes.string
  }
  render() {
    const { checked, onChange, label } = this.props;
    return (<span onClick={() => onChange(!checked)} className={styles.box}>
      <span className={[styles.checkbox, checked ? styles.checked : ''].join(' ')}>
        {checked ? <TickSVG /> : null}
      </span>
      <span className={styles.label}>{label}</span>
    </span>);
  }
}
