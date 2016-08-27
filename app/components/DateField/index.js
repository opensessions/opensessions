import React, { PropTypes } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
require('react-datepicker/dist/react-datepicker.css');

const dateToISO = date => date.toISOString().substr(0, 10);

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
    const value = dateToISO(date);
    this.props.onChange(value);
  }
  handleChange = event => {
    const { value } = event.target;
    this.props.onChange(value);
  }
  render() {
    const { value, position } = this.props;
    const { isMobile } = this.state;
    let input;
    if (isMobile) {
      const attrs = {
        value: value ? dateToISO(new Date(value)) : null,
        type: 'date',
        onChange: this.handleChange,
        min: dateToISO(new Date())
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
