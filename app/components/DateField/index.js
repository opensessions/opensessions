import React, { PropTypes } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
require('react-datepicker/dist/react-datepicker.css');

export default class DateField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func,
    position: PropTypes.string
  }
  constructor() {
    super();
    this.state = {
      isMobile: navigator.userAgent.match(/(android|iphone)/i) !== null
    };
  }
  handleDateChange = date => {
    date.minutes(date.minutes() + date.utcOffset());
    const value = date.toISOString().substr(0, 10);
    this.props.onChange(value);
  }
  handleChange = event => {
    const { value } = event.target;
    this.handleDateChange(new Date(value));
  }
  render() {
    const { value, position } = this.props;
    const { isMobile } = this.state;
    let input;
    if (isMobile) {
      const attrs = {
        value: value ? (new Date(value)).toISOString().substr(0, 10) : null,
        type: 'date',
        onChange: this.handleChange
      };
      input = <input {...attrs} />;
    } else {
      const now = moment(Date.now());
      const selected = value ? moment(value) : null;
      const dateAttrs = { selected, dateFormat: 'DD/MM/YYYY', onChange: this.handleDateChange, minDate: now };
      const floatRight = position === 'right' ? { popoverTargetOffset: '0 12px', popoverTargetAttachment: 'top right' } : {};
      input = <DatePicker {...dateAttrs} {...floatRight} />;
    }
    return input;
  }
}
