import React, { PropTypes } from 'react';

import LoginButton from 'components/LoginButton';
import LoadingMessage from 'components/LoadingMessage';

import styles from './styles.css';

export default class Authenticated extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: PropTypes.node,
    message: PropTypes.string,
    button: PropTypes.any
  };
  static contextTypes = {
    user: PropTypes.object,
    locks: PropTypes.object,
    isLoadingUser: PropTypes.bool
  }
  renderButton() {
    let { button } = this.props;
    if (!(button instanceof Array)) button = [button];
    return <ol>{button.map((text, key) => <li key={key}><LoginButton lock={this.context.locks[key === 0 ? 'signup' : 'login']}>{text}</LoginButton></li>)}</ol>;
  }
  renderOut() {
    const { message, button } = this.props;
    if (this.context.isLoadingUser) return (<div className={styles.noAuth}><LoadingMessage message="Loading" ellipsis /></div>);
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
