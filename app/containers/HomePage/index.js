import React from 'react';

import { Link } from 'react-router';

import styles from './styles.css';

export default class HomePage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div className={styles.container}>
        <h1>Welcome to Open Sessions!</h1>
        <p><Link to="/session/add">+ add session</Link></p>
      </div>
    );
  }
}
