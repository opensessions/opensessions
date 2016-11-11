import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class MessageModal extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: PropTypes.string,
    size: PropTypes.string
  }
  render() {
    const { children, size } = this.props;
    return (<div className={[styles.modal, size ? styles[size] : ''].join(' ')}>
      {children}
    </div>);
  }
}
