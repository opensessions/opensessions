import React, { PropTypes } from 'react';

export default class LoginButton extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    locks: PropTypes.object
  };
  static propTypes = {
    lock: PropTypes.string,
    children: PropTypes.node,
  }
  render() {
    return <a tabIndex="0" onClick={() => this.context.locks[this.props.lock].show()}>{this.props.children}</a>;
  }
}
