import React, { PropTypes } from 'react';

export default class Sticky extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: PropTypes.any
  };
  getOffset() {
    if (!this.refs.sticky) return 15;
    const getWidth = (element) => parseInt(getComputedStyle(element).width, 10);
    return getWidth(document.body) - getWidth(this.refs.sticky);
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
