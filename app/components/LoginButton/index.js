import React, { PropTypes } from 'react';

export default class LoginButton extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    lock: PropTypes.object,
    children: PropTypes.node,
  }
  showLock = () => {
    const { lock } = this.props;
    lock.show();
  }
  render() {
    return <a tabIndex="0" onClick={this.showLock}>{this.props.children}</a>;
  }
}
