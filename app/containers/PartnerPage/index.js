import React from 'react';

import Banner from '../../components/Banner';
import Button from '../../components/Button';

import styles from './styles.css';

export default class PartnerPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (<div className={styles.partner}>
      <Banner>
        <h1>Become a Partner</h1>
        <h2>Your gateway to the most popular physical activity finders on the web</h2>
      </Banner>
      <section className={styles.section}>
        <h2>Larger providers & booking system integration</h2>
        <p>If you already use a booking system, club management system, or similar, then we can connect directly to that system to access the sessions that you want to promote. We're already connected to a number of systems as part of the Openactive community of open data organisations. Please follow the link below to pass us your contact details and we'll be in touch to discuss next steps.</p>
        <p><Button onClick={() => window.location = 'https://www.openactive.io/join.html'}>Leave us your details</Button></p>
      </section>
    </div>);
  }
}
