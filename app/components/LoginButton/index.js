import React, { PropTypes } from 'react';

import AuthModal from '../../containers/Modals/Authorize';

import cookie from '../../utils/cookie';

import buttonStyles from '../Button/styles.css';

export default class LoginButton extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    modal: PropTypes.object,
    user: PropTypes.object
  };
  static propTypes = {
    children: PropTypes.node,
    button: PropTypes.bool,
    redirect: PropTypes.string
  }
  showLock = () => {
    cookie.set('postlogin_redirect', this.props.redirect);
    this.context.modal.dispatch({ component: <AuthModal redirect={this.props.redirect} /> });
  }
  render() {
    return this.context.user ? null : <a className={this.props.button ? buttonStyles.button : null} tabIndex={0} onClick={this.showLock} onKeyUp={event => event.keyCode === 13 && event.target.click()}>{this.props.children}</a>;
  }
}
