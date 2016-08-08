import React, { PropTypes } from 'react';

export default class Sticky extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: PropTypes.any
  };
  getOffset() {
    return 15;
  }
  render() {
    return (<div ref="sticky">
      <div style={{ position: 'fixed', zIndex: 1, left: 0, right: this.getOffset() }}>
        {this.props.children}
      </div>
      <div>
        {this.props.children}
      </div>
    </div>);
  }
}
