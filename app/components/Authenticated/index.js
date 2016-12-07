import React, { PropTypes } from 'react';

import LoginButton from '../LoginButton';
import LoadingMessage from '../LoadingMessage';

import styles from './styles.css';

export default class Authenticated extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: PropTypes.node,
    message: PropTypes.string,
    button: PropTypes.any,
    out: PropTypes.node
  };
  static contextTypes = {
    user: PropTypes.object,
    isLoadingUser: PropTypes.bool
  }
  renderButton() {
    let { button } = this.props;
    if (!(button instanceof Array)) button = [button];
    return button.map((text, key) => <span key={key}><LoginButton lock={key === 0 ? 'signup' : 'login'}>{text}</LoginButton></span>);
  }
  renderOut() {
    const { message, button, out } = this.props;
    if (out) return out;
    if (this.context.isLoadingUser) return (<div className={styles.noAuth}><LoadingMessage inline message="Loading" ellipsis /></div>);
    return (<div className={styles.noAuth}>
      {message ? <p>{message}</p> : null}
      {button ? this.renderButton() : null}
    </div>);
  }
  render() {
    return (<div>
      {this.context.user ? this.props.children : this.renderOut()}
    </div>);
  }
}
