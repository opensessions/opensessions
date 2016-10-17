import React from 'react';
import { Link } from 'react-router';

import Authenticated from '../Authenticated';
import LogoutLink from '../LogoutLink';

import styles from './styles.css';

export default class Footer extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.column}>
            <h2>Info</h2>
            <p><Link to="/">About this site</Link></p>
            <p><Link to="/terms">Terms</Link></p>
            <p className={styles.iconInfo}>Icons made by <a href="http://www.flaticon.com/authors/madebyoliver" title="Madebyoliver">Madebyoliver</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank" rel="noopener noreferrer">CC 3.0 BY</a></p>
          </div>
          <div className={styles.column}>
            <Authenticated>
              <h2>Your account</h2>
              <p><LogoutLink>Log out</LogoutLink></p>
            </Authenticated>
          </div>
          <div className={styles.column}>
            <p>In association with</p>
            <p><a href="https://londonsport.org"><img src="/images/london-sport.png" alt="London Sport" /></a></p>
          </div>
        </div>
      </footer>
    );
  }
}
