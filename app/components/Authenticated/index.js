import React from 'react';

import styles from './styles.css';

export default class Authenticated extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: React.PropTypes.node,
    message: React.PropTypes.string,
  }
  static contextTypes = {
    user: React.PropTypes.object,
  }
  render() {
    const message = (<div className={styles.noAuth}>{this.props.message}</div>);
    return (
      <div>
        {this.context.user ? this.props.children : message}
      </div>
    );
  }
}
