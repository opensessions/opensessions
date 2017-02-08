import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class InfoBox extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    message: PropTypes.string,
    type: PropTypes.string
  }
  render() {
    const { message } = this.props;
    return (<div className={styles.info}>
      <div className={styles.message}>
        {message}
      </div>
    </div>);
  }
}
