import React from 'react';

export default class LoginButton extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    lock: React.PropTypes.object,
    children: React.PropTypes.element,
  }
  constructor() {
    super();
    this.showLock = this.showLock.bind(this);
  }
  showLock() {
    const { lock } = this.props;
    lock.show({
      icon: '/images/app-icon.png',
      socialBigButtons: true,
      // callbackURL: window.location.origin,
      // callbackOnLocationHash: true
    });
  }
  render() {
    return <a onClick={this.showLock}>{this.props.children}</a>;
  }
}
