import React, { PropTypes } from 'react';

import LoadingIcon from '../LoadingIcon';

import styles from './styles.css';

export default class LoadingMessage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    message: PropTypes.string,
    ellipsis: PropTypes.bool,
    inline: PropTypes.bool
  }
  render() {
    return (<div className={[styles.loadingMessage, this.props.inline ? styles.inline : ''].join(' ')}>
      {this.props.message}
      {this.props.ellipsis ? <LoadingIcon /> : null}
    </div>);
  }
}
