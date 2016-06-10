/*
 * Footer
 */

import React from 'react';
import { Link } from 'react-router';

import styles from './styles.css';

export default class Footer extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <footer className={styles.footer}>
        <p>There will be stuff <Link to="/">like links</Link> in the footer</p>
      </footer>
    );
  }
}
