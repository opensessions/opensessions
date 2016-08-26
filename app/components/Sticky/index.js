import React, { PropTypes } from 'react';

export default class Sticky extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    zIndex: PropTypes.number,
    children: PropTypes.any
  };
  getOffset() {
    if (!this.refs.sticky) return 4;
    const getWidth = (element) => parseInt(getComputedStyle(element).width, 10);
    return getWidth(document.body) - getWidth(this.refs.sticky);
  }
  render() {
    const { children, zIndex } = this.props;
    return (<div ref="sticky">
      <div style={{ position: 'fixed', zIndex: zIndex || 1, left: 0, right: this.getOffset() }}>
        {children}
      </div>
      <div>{children}</div>
    </div>);
  }
}
