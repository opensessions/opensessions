import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class LoadingIcon extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return <span className={styles.icon} />;
  }
}
