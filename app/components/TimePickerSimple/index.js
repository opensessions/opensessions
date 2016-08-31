import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class TimePickerSimple extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    step: PropTypes.number
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
  minsEvent = event => {
    const { type, target } = event;
    if (type === 'change') {
      this.changeTime(this.state.hours, parseInt(target.value.substr(-2), 10));
    }
  }
  render() {
    const { step } = this.props;
    const { hours, minutes } = this.state;
    return (<div className={styles.timePicker}>
      <select value={hours !== null ? hours : ''} onChange={this.hourChange}>
        <option key="null" value="" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(hour => {
          const offset = Math.ceil((hour - 12) / 12);
          return <option key={hour} value={hour}>{hour - (offset * 12)} {hour >= 12 ? 'pm' : 'am'}</option>;
        })}
      </select>
      <select value={minutes === null ? '' : minutes} onChange={this.minsEvent}>
        <option key="null" value="" />
        {Array(...Array(60 / step)).map((v, k) => k * step).map(mins => <option key={mins} value={mins}>{`0${mins}`.slice(-2)}</option>)}
      </select>
    </div>);
  }
}
