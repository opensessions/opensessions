import React, { PropTypes } from 'react';

import AuthModal from '../../containers/Modals/Authorize';

import buttonStyles from '../Button/styles.css';

export default class LoginButton extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    modal: PropTypes.object
  };
  static propTypes = {
    children: PropTypes.node,
    button: PropTypes.bool
  }
  showLock = () => this.context.modal.dispatch({ component: <AuthModal /> })
  render() {
    return <a className={this.props.button ? buttonStyles.button : null} tabIndex="0" onClick={this.showLock} onKeyUp={event => event.keyCode === 13 && event.target.click()}>{this.props.children}</a>;
  }
}
