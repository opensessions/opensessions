import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class HomePage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: PropTypes.node
  }
  render() {
    return (<section className={styles.heading}>
      <div className={styles.container}>
        {this.props.children}
      </div>
    </section>);
  }
}
