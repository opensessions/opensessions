import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class Tooltip extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    tip: PropTypes.string.isRequired,
    isOpened: PropTypes.bool,
    style: PropTypes.string
  }
  render() {
    const { tip, isOpened, style } = this.props;
    return <span className={[styles.tooltip, isOpened ? styles.open : '', style ? styles[style] : ''].join(' ')}><span className={styles.tip}>{tip}</span></span>;
  }
}
