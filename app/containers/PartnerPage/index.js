import React from 'react';

import styles from './styles.css';

export default class PartnerPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (<div className={styles.partner}>
      <section className={styles.heading}>
        <h1>Become a Partner</h1>
        <h2>Your gateway to the most popular physical activity finders on the web</h2>
      </section>
      <section>
        <h2>Larger providers & booking system integration</h2>
        <p>If you already use a booking system, club management system, or similar, then we can connect directly to that system to access the sessions that you want to promote. We're already connected to a number of systems as part of the Openactive community of open data organisations. Please follow the link below to pass us your contact details and we'll be in touch to discuss next steps.</p>
        <p><a href="https://www.openactive.io/join.html" className={styles.button}>Leave us your details</a></p>
      </section>
    </div>);
  }
}
