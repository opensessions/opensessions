import React, { PropTypes } from 'react';

import TickSVG from '../../SVGs/Tick';

import styles from './styles.css';

export default class Checkbox extends React.PureComponent {
  static propTypes = {
    checked: PropTypes.bool,
    onChange: PropTypes.func,
    label: PropTypes.string
  }
  onKeyUp = event => {
    if (event.keyCode === 13) {
      this.props.onChange(!this.props.checked);
      event.preventDefault();
      event.stopPropagation();
    }
  }
  render() {
    const { checked, onChange, label } = this.props;
    return (<span onClick={() => onChange(!checked)} className={styles.box}>
      <span className={[styles.checkbox, checked ? styles.checked : ''].join(' ')} tabIndex={0} onKeyUp={this.onKeyUp}>
        <TickSVG />
      </span>
      <span className={styles.label}>{label}</span>
    </span>);
  }
}
