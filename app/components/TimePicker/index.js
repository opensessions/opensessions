import React from 'react';

import styles from './styles.css';

export default class TimePicker extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func,
  }
  constructor() {
    super();
    this.state = { hours: 0, minutes: 0 };
  }
  componentWillReceiveProps(nextProps) {
    const time = nextProps.value;
    if (!time) return;
    const frags = time.split(':').map((frag) => parseInt(frag, 10));
    this.setState({ hours: frags[0], minutes: frags[1] });
  }
  changeTime = (hours, minutes) => {
    this.setState({ hours, minutes });
    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;
    const time = [hours, minutes, '00'].join(':');
    if (this.props.onChange) this.props.onChange(time);
  }
  hourChange = (event) => {
    this.changeTime(parseInt(event.target.value), this.state.minutes);
  }
  minsInc = () => {
    let { hours, minutes } = this.state;
    minutes += 1;
    if (minutes > 59) {
      hours += 1;
      minutes -= 60;
      if (hours > 23) {
        return;
      }
    }
    this.changeTime(hours, minutes);
  }
  minsDec = () => {
    let { hours, minutes } = this.state;
    minutes -= 1;
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
      if (hours < 0) {
        return;
      }
    }
    this.changeTime(hours, minutes);
  }
  minsEvent = (event) => {
    const { type, keyCode } = event;
    if (type === 'keydown') {
      const fns = { 38: 'minsInc', 40: 'minsDec' };
      if (keyCode in fns) {
        this[fns[keyCode]]();
      }
    } else if (type === 'wheel') {
      if (event.deltaY > 0) {
        this.minsDec();
      } else if (event.deltaY < 0) {
        this.minsInc();
      }
    }
  }
  meridianChange = (event) => {
    const { value } = event.target;
    const deltas = { am: -12, pm: 12 };
    if (value in deltas) {
      this.changeTime(this.state.hours + deltas[value], this.state.minutes);
    }
  }
  render() {
    const { value } = this.props;
    const { hours, minutes } = this.state;
    const meridian = hours >= 12 ? 'pm' : 'am';
    return (<div className={styles.timePicker}>
      <select value={hours} onChange={this.hourChange}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour) => <option key={hour} value={meridian === 'am' ? hour : hour + 12}>{hour < 10 ? '0' : ''}{hour}</option>)}
      </select>
      <input type="text" value={`${minutes < 10 ? '0' : ''}${minutes}`} readOnly onKeyDown={this.minsEvent} onWheel={this.minsEvent} />
      <span className={styles.rocker}>
        <a onClick={this.minsInc}>+</a>
        <a onClick={this.minsDec}>-</a>
      </span>
      <select value={meridian} onChange={this.meridianChange}>
        {['am', 'pm'].map((mid) => <option key={mid} value={mid}>{mid}</option>)}
      </select>
    </div>);
  }
}
