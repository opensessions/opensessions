import React, { PropTypes } from 'react';

import TickSVG from '../../SVGs/Tick';

import styles from './styles.css';

const KEY_ENTER = 13;
const KEY_SPACE = 32;

export default class BoolBox extends React.PureComponent {
  static propTypes = {
    checked: PropTypes.bool,
    onChange: PropTypes.func,
    type: PropTypes.string
  }
  onKeyDown = event => {
    if ([KEY_ENTER, KEY_SPACE].indexOf(event.keyCode) !== -1) {
      this.props.onChange(!this.props.checked);
      event.preventDefault();
      event.stopPropagation();
    }
  }
  render() {
    const { checked, onChange, type } = this.props;
    return (
      <span onClick={() => onChange(!checked)} className={[styles.checkbox, checked ? styles.checked : '', type === 'radio' ? styles.radio : ''].join(' ')} tabIndex={0} onKeyDown={this.onKeyDown}>
        <TickSVG />
      </span>
    );
  }
}
