import React from 'react';
import { Link } from 'react-router';

import styles from './styles.css';

export default class Footer extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.column}>
            <h2>Providers</h2>
            <p><Link to="/">Register your club</Link></p>
            <p><Link to="/">Become a partner</Link></p>
          </div>
          <div className={styles.column}>
            <h2>Support</h2>
            <p><Link to="/">Help Desk</Link></p>
          </div>
          <div className={styles.column}>
            <h2>Info</h2>
            <p><Link to="/">Contact us</Link></p>
            <p><Link to="/">About this site</Link></p>
            <p><Link to="/">Terms & Conditions</Link></p>
            <p><Link to="/">Site map</Link></p>
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
