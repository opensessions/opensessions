import React from 'react';

import styles from './styles.css';

export default class LoadingMessage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    message: React.PropTypes.string,
    ellipsis: React.PropTypes.boolean,
  }
  render() {
    return (<div className={styles.loadingMessage}>
      {this.props.message}{this.props.ellipsis ? <span className={styles.ellipsis}></span> : null}
    </div>);
  }
}
