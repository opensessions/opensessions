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
      const vals = this.props.options.map(option => option.value);
      const newIndex = vals.indexOf(this.props.value) + arrowDeltas[keyCode];
      if (vals[newIndex]) {
        this.props.onChange(vals[newIndex]);
      }
    }
  }
  render() {
    return (<div className={styles.iconRadio}>
      <ol>
        {this.props.options.map(option => {
          const selected = option.value === this.props.value;
          return (<li className={selected ? styles.selected : ''} key={option.value}>
            <label tabIndex="0" onKeyUp={this.tabKey}>
              {option.icon || <img src={selected ? option.selectedSrc : option.src} role="presentation" />}
              {option.text}
              <input type="radio" onChange={this.handleChange} value={option.value} selected={selected} />
            </label>
          </li>);
        })}
      </ol>
    </div>);
  }
}
