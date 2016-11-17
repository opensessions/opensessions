import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class PriceField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func
  }
  constructor() {
    super();
    this.state = {};
  }
  parseNum(value) {
    const num = parseFloat(value);
    return num % 1 ? num.toFixed(2) : num;
  }
  inputEvent = event => {
    const { target, type } = event;
    const { onChange } = this.props;
    let { value } = target;
    if (type === 'change') {
      onChange(value);
    } else if (type === 'keydown') {
      const { keyCode } = event;
      const deltas = { 38: 1, 40: -1 };
      if (keyCode in deltas) {
        value = Math.max(0, parseFloat(value) + deltas[keyCode]);
        onChange(this.parseNum(value));
      }
    }
  }
  focusEvent = event => {
    this.setState({ hasFocus: event.type === 'focus' });
  }
  render() {
    const { value } = this.props;
    const attrs = { onFocus: this.focusEvent, onBlur: this.focusEvent };
    return (<div className={[styles.field, this.state.hasFocus ? styles.hasFocus : ''].join(' ')} onClick={() => this.refs.input.focus()}>
      <strong>&pound;</strong>
      <input value={value !== undefined ? value : ''} onChange={this.inputEvent} onKeyDown={this.inputEvent} ref="input" {...attrs} />
    </div>);
  }
}
