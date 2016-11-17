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
    return <a tabIndex="0" onClick={() => this.context.locks[this.props.lock].show()} onKeyUp={event => event.keyCode === 13 && event.target.click()}>{this.props.children}</a>;
  }
}
