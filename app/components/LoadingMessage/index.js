import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class LoadingMessage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    message: PropTypes.string,
    ellipsis: PropTypes.bool,
  }
  render() {
    return (<div className={styles.loadingMessage}>
      {this.props.message}{this.props.ellipsis ? <span className={styles.ellipsis} /> : null}
    </div>);
  }
}
