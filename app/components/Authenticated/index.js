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
    const { message, button } = this.props;
    return (<div className={styles.noAuth}>
      <p>{message}</p>
      {button ? <p><LoginButton lock={this.context.lock}>{button}</LoginButton></p> : null}
    </div>);
  }
  render() {
    return (<div>
      {this.context.user ? this.props.children : this.renderOut()}
    </div>);
  }
}
