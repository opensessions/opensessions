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
            <p className={styles.iconInfo}><a href="https://github.com/opensessions/opensessions">Open Sessions</a> funded by <a href="https://londonsport.org">London Sport</a></p>
          </div>
          <div className={styles.column}>
            <Authenticated>
              <h2>Your account</h2>
              <p><LogoutLink>Log out</LogoutLink></p>
            </Authenticated>
          </div>
        </div>
      </footer>
    );
  }
}
