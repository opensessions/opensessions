import React from 'react';

import styles from './styles.css';

export default class TimePicker extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func,
  }
  constructor() {
    super();
    this.state = { hours: null, minutes: null, incVal: 1 };
  }
  componentWillMount() {
    const time = this.props.value;
    if (time) this.valueToState(time);
  }
  componentWillReceiveProps(nextProps) {
    const time = nextProps.value;
    if (time) this.valueToState(time);
  }
  valueToState(time) {
    const frags = time.split(':').map(frag => parseInt(frag, 10));
    this.setState({ hours: frags[0], minutes: frags[1] });
  }
  changeTime = (hours, minutes) => {
    this.setState({ hours, minutes });
    hours = `0${hours || 0}`.slice(-2);
    minutes = `0${minutes || 0}`.slice(-2);
    const time = [hours, minutes, '00'].join(':');
    this.props.onChange(time);
  }
  hourChange = event => {
    this.changeTime(parseInt(event.target.value, 10), this.state.minutes);
  }
  minsChange = isIncrease => {
    const { incVal } = this.state;
    let { hours, minutes } = this.state;
    minutes += incVal * (isIncrease ? 1 : -1);
    if (minutes > 59) {
      hours += 1;
      minutes -= 60;
    }
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    hours = (hours + 24) % 24;
    this.changeTime(hours, minutes);
  }
  minsInc = () => this.minsChange(true)
  minsDec = () => this.minsChange(false)
  minsEvent = event => {
    const { type, keyCode, target } = event;
    const fns = { 38: 'minsInc', 40: 'minsDec' };
    const positions = { 37: 0, 39: 1 };
    if (keyCode && (keyCode in positions || keyCode in fns)) {
      event.preventDefault();
    }
    if (type === 'keyup') {
      if (keyCode in fns) {
        this[fns[keyCode]]();
      } else if (keyCode in positions) {
        const start = positions[keyCode];
        target.select();
        target.selectionStart = start;
        target.selectionEnd = start + 1;
        this.setState({ incVal: start === 0 ? 10 : 1 });
        event.preventDefault();
      } else {
        target.select();
        target.selectionStart = 1;
        target.selectionEnd = 2;
      }
    } else if (type === 'wheel') {
      event.preventDefault();
      if (event.deltaY > 0) {
        this.minsDec();
      } else if (event.deltaY < 0) {
        this.minsInc();
      }
    } else if (type === 'change') {
      this.changeTime(this.state.hours, parseInt(target.value.substr(-2), 10));
    } else if (type === 'focus') {
      target.select();
      target.selectionEnd = 1;
      this.setState({ incVal: 10 });
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
    const { hours, minutes } = this.state;
    const meridian = hours >= 12 ? 'pm' : 'am';
    return (<div className={styles.timePicker}>
      <select value={hours !== null ? hours : ''} onChange={this.hourChange}>
        <option key="null" value="" />
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(hour => <option key={hour} value={(hour % 12) + (meridian === 'am' ? 0 : 12)}>{hour}</option>)}
      </select>
      <input type="text" value={minutes === null ? '' : `${('0' + minutes).slice(-2)}`} onChange={this.minsEvent} onKeyUp={this.minsEvent} onWheel={this.minsEvent} onFocus={this.minsEvent} />
      {hours !== null ? <select value={meridian} onChange={this.meridianChange}>
        {['am', 'pm'].map(mid => <option key={mid} value={mid}>{mid}</option>)}
      </select> : null}
    </div>);
  }
}
