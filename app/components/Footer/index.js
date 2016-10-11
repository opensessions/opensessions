import React from 'react';
import { Link } from 'react-router';

import Authenticated from 'components/Authenticated';
import LogoutLink from 'components/LogoutLink';

import styles from './styles.css';

export default class Footer extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.column}>
            <h2>Info</h2>
            <p><a href="http://opensessions.io">About this site</a></p>
            <p><Link to="/terms">Terms</Link></p>
            <p className={styles.iconInfo}>Icons made by <a href="http://www.flaticon.com/authors/madebyoliver" title="Madebyoliver">Madebyoliver</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank" rel="noopener noreferrer">CC 3.0 BY</a></p>
            <p><Link to="/">Contact us</Link></p>
            <p><Link to="/">Site map</Link></p>
          </div>
          <div className={styles.column}>
            <Authenticated>
              <h2>Your account</h2>
              <p><Link to="/">Help Desk</Link></p>
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
