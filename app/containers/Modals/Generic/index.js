import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class MessageModal extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: PropTypes.string,
    size: PropTypes.string,
    isLoading: PropTypes.bool
  }
  render() {
    const { children, size, isLoading } = this.props;
    return (<div className={[styles.modal, size ? styles[size] : '', isLoading ? styles.loading : ''].join(' ')}>
      {children}
    </div>);
  }
}
