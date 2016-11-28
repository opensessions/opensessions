import React, { PropTypes } from 'react';

import TickSVG from '../../SVGs/Tick';

import styles from './styles.css';

const KEY_ENTER = 13;
const KEY_SPACE = 32;

export default class Checkbox extends React.PureComponent {
  static propTypes = {
    checked: PropTypes.bool,
    onChange: PropTypes.func,
    label: PropTypes.string
  }
  onKeyDown = event => {
    if ([KEY_ENTER, KEY_SPACE].indexOf(event.keyCode) !== -1) {
      this.props.onChange(!this.props.checked);
      event.preventDefault();
      event.stopPropagation();
    }
  }
  render() {
    const { checked, onChange, label } = this.props;
    return (<span onClick={() => onChange(!checked)} className={styles.box}>
      <span className={[styles.checkbox, checked ? styles.checked : ''].join(' ')} tabIndex={0} onKeyDown={this.onKeyDown}>
        <TickSVG />
      </span>
      <span className={styles.label}>{label}</span>
    </span>);
  }
}
