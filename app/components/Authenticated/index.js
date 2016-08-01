import React from 'react';

import LoginButton from 'components/LoginButton';

import styles from './styles.css';

export default class Authenticated extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: React.PropTypes.node,
    message: React.PropTypes.string,
    button: React.PropTypes.string
  }
  static contextTypes = {
    user: React.PropTypes.object,
    lock: React.PropTypes.object,
  }
  renderOut() {
    const message = (<div className={styles.noAuth}>{this.props.message}</div>);
    return (<div>
      {message}
      {this.props.button ? <LoginButton lock={this.context.lock}>{this.props.button}</LoginButton> : null}
    </div>);
  }
  render() {
    return (<div>
      {this.context.user ? this.props.children : this.renderOut()}
    </div>);
  }
}
