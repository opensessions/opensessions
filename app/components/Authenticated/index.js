import React, { PropTypes } from 'react';

import LoginButton from 'components/LoginButton';

import styles from './styles.css';

export default class Authenticated extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: PropTypes.node,
    message: PropTypes.string,
    button: PropTypes.any
  };
  static contextTypes = {
    user: PropTypes.object,
    lockSignUp: PropTypes.object,
    lockLogin: PropTypes.object,
  }
  renderButton() {
    let { button } = this.props;
    if (!(button instanceof Array)) button = [button];
    return <ol>{button.map((button, key) => <li key={key}><LoginButton lock={this.context[key === 0 ? 'lockSignUp' : 'lockLogin']}>{button}</LoginButton></li>)}</ol>;
  }
  renderOut() {
    const { message, button } = this.props;
    return (<div className={styles.noAuth}>
      <p>{message}</p>
      {button ? this.renderButton() : null}
    </div>);
  }
  render() {
    return (<div>
      {this.context.user ? this.props.children : this.renderOut()}
    </div>);
  }
}
