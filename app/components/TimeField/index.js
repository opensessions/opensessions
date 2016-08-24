import React, { PropTypes } from 'react';

import TimePicker from 'components/TimePicker';

export default class TimeField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func
  };
  constructor() {
    super();
    this.state = {
      isMobile: navigator.userAgent.match(/(android|iphone)/i) !== null
    };
  }
  handleChange = event => {
    const { value } = event.target;
    this.onChange(value);
  }
  onChange = value => {
    this.props.onChange(value);
  }
  render() {
    const { value } = this.props;
    const { isMobile } = this.state;
    const attrs = { value };
    let input;
    if (isMobile) {
      input = <input {...attrs} type="time" onChange={this.handleChange} />;
    } else {
      input = <TimePicker {...attrs} onChange={this.onChange} />;
    }
    return input;
  }
}
