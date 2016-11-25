import React, { PropTypes } from 'react';

import AuthModal from '../../containers/Modals/Authorize';

export default class LoginButton extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    modal: PropTypes.object
  };
  static propTypes = {
    lock: PropTypes.string,
    children: PropTypes.node,
  }
  showLock = () => this.context.modal.dispatch({ component: <AuthModal /> })
  render() {
    return <a tabIndex="0" onClick={this.showLock} onKeyUp={event => event.keyCode === 13 && event.target.click()}>{this.props.children}</a>;
  }
}
