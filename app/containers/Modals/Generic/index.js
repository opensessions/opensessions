import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class MessageModal extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: PropTypes.string
  }
  render() {
    const { children } = this.props;
    return (<div className={styles.modal}>
      {children}
    </div>);
  }
}
