import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class IconRadioField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.string,
    options: PropTypes.array,
  }
  handleChange = event => {
    const { value } = event.target;
    this.props.onChange(value);
  }
  tabKey = event => {
    const { keyCode } = event;
    const arrowDeltas = { 37: -1, 39: 1 };
    if (keyCode === 13) {
      event.target.click();
    } else if (keyCode in arrowDeltas) {
      const { options, value, onChange } = this.props;
      const vals = options.map(option => option.value);
      const newIndex = vals.indexOf(value) + arrowDeltas[keyCode];
      if (vals[newIndex]) {
        onChange(vals[newIndex]);
      }
    }
  }
  render() {
    const { value, options } = this.props;
    const attrs = { type: 'radio', onChange: this.handleChange };
    return (<div className={styles.iconRadio}>
      <ol>
        {options.map(option => {
          const selected = option.value === value;
          return (<li className={selected ? styles.selected : ''} key={option.value}>
            <label tabIndex="0" onKeyUp={this.tabKey}>
              {option.icon || <img src={selected ? option.selectedSrc : option.src} role="presentation" />}
              {option.text}
              <input {...attrs} value={option.value} selected={selected} />
            </label>
          </li>);
        })}
      </ol>
    </div>);
  }
}
