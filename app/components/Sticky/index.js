import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class Sticky extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    zIndex: PropTypes.number,
    children: PropTypes.any
  };
  getOffset() {
    if (!this.refs.sticky) return 4;
    const getWidth = element => parseInt(getComputedStyle(element).width, 10);
    return getWidth(document.body) - getWidth(this.refs.sticky);
  }
  render() {
    const { children, zIndex } = this.props;
    return (<div ref="sticky" className={styles.sticky}>
      {window.document ? <div className={styles.fixed} style={{ zIndex: zIndex || 1, right: 0 }}>{children}</div> : null}
      <div className={styles.static}>{children}</div>
    </div>);
  }
}
