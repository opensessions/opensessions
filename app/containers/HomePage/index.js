import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import Helmet from 'react-helmet';

import Authenticated from '../../components/Authenticated';
import Banner from '../../components/Banner';
import Button from '../../components/Button';
import NotificationBar from '../../components/NotificationBar';
import SessionList from '../SessionList';
import LoadingMessage from '../../components/LoadingMessage';

import styles from './styles.css';

export default class HomePage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    locks: PropTypes.object,
    user: PropTypes.object,
    notifications: PropTypes.array,
  }
  renderSessionList() {
    const { user } = this.context;
    if (!user) return <LoadingMessage message="Loading user" ellipsis />;
    return <SessionList query={{ owner: user.user_id }} />;
  }
  renderMarketingSections() {
    return (<div className={styles.sections}>
      <section>
        <div className={styles.container}>
          <h1>Why join open sessions?</h1>
          <p>Open Sessions provides you with one place to easily upload and update your session details, and makes those session details visible to thousands of potential participants across the best sports, fitness and health focussed websites on the web.</p>
          <p>And it's free. Forever.</p>
          <Button onClick={() => this.context.locks.signup.show()}>Increase the visibility of my sessions</Button>
        </div>
      </section>
      <section className={styles.featured}>
        <div className={styles.container}>
          <div className={styles.columns}>
            <div className={styles.column}>
              <h1>Reach new audiences across a network of activity finders</h1>
              <p>A network of websites help thousands of people find ways to be active. Open Sessions features your sessions on these websites allowing potential participants to find your sessions.</p>
            </div>
            <div className={styles.column}>
              <h1>Update your session information in one place</h1>
              <p>No more duplication of information and keeping multiple websites up to date - Open Sessions reduces the effort required to promote your activity sessions.</p>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className={styles.container}>
          <h1>Do you already use a system to manage your sessions?</h1>
          <p>If you already use a booking system, club management system, or similar, then we can connect directly to that system to access the sessions that you want to promote. Get in touch with us to find out more.</p>
          <Button to="/partner">Become a partner</Button>
        </div>
      </section>
    </div>);
  }
  renderLandingPage() {
    return (<div className={styles.landing}>
      <Banner>
        <h1>Get your sessions discovered</h1>
        <h2>Your gateway to the most popular physical activity finders on the web</h2>
        <Authenticated button={['Sign Up', 'Login']}>
          <p><Link to="/session/add"><b>+</b> Add a session</Link></p>
        </Authenticated>
      </Banner>
      {this.context.user ? null : this.renderMarketingSections()}
    </div>);
  }
  render() {
    return (<div>
      <Helmet meta={[{ property: 'og:title', content: 'Open Sessions' }, { property: 'description', content: 'Open Sessions is your gateway to the most popular physical activity finders on the web.' }]} />
      <NotificationBar notifications={this.context.notifications} zIndex={4} />
      {this.renderLandingPage()}
      <Authenticated>
        <div className={styles.container}>
          {this.renderSessionList()}
        </div>
      </Authenticated>
    </div>);
  }
}
