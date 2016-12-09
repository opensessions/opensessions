import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import Helmet from 'react-helmet';

import Authenticated from '../../components/Authenticated';
import Banner from '../../components/Banner';
import Button from '../../components/Button';
import LoginButton from '../../components/LoginButton';
import NotificationBar from '../../components/NotificationBar';
import SessionList from '../SessionList';
import LoadingMessage from '../../components/LoadingMessage';

import styles from './styles.css';

import { apiFetch } from '../../utils/api';

export default class HomePage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: PropTypes.object,
  }
  constructor() {
    super();
    this.state = {};
  }
  componentDidMount() {
    this.fetchData();
  }
  fetchData = () => apiFetch('/api/stats').then(stats => {
    this.setState({ stats });
  })
  renderSessionList() {
    const { user } = this.context;
    if (!user) return <LoadingMessage message="Loading user" ellipsis />;
    return <SessionList query={{ owner: user.user_id }} heading={<h1>Your Sessions:</h1>} />;
  }
  renderMarketingSections() {
    return (<div className={styles.sections}>
      <section>
        <div className={styles.container}>
          <h1>What is open sessions?</h1>
          <p>Open Sessions provides you with one place to easily upload and update your session details, and makes them visible to thousands of potential participants across the best sports, fitness and health-focussed websites on the web.</p>
          <p>And it's free. Forever.</p>
          <LoginButton button redirect="/session/add">Start uploading today</LoginButton>
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
          <h1>Already have a session manager?</h1>
          <p>If you already use a booking system, club management system, or similar, then we can connect directly to that system to access the sessions that you want to promote. Get in touch with us to find out more.</p>
          <Button to="/partner">Become a partner</Button>
        </div>
      </section>
    </div>);
  }
  renderLandingPage() {
    const steps = [
      { text: 'You tell us about the sessions you run', img: '/images/landing-step1.png' },
      { text: 'We publish them on the web\'s activity finders', img: '/images/landing-step2.png' },
      { text: '100s more people can find out about them', img: '/images/landing-step3.png' }
    ];
    const { stats } = this.state;
    return (<div className={styles.landing}>
      <Banner>
        <h1>Get your sessions found</h1>
        <h2>The free way to promote your physical activity sessions</h2>
        <br /><br />
        <Authenticated out={<LoginButton redirect="/session/add"><b>+</b> Add a session</LoginButton>}>
          <p><Link to="/session/add"><b>+</b> Add a session</Link></p>
        </Authenticated>
      </Banner>
      <div className={styles.steps}>
        <h1>How Open Sessions works</h1>
        <ol>
          {[steps.map((step, key) => (<li>
            <img src={step.img} role="presentation" />
            <p><span className={styles.num}>{key + 1}.</span> {step.text}</p>
          </li>))]}
        </ol>
        <p><LoginButton button redirect="/session/add">Get started</LoginButton></p>
        {stats ? <p><span className={styles.stats}>{stats.sessions.published}</span> sessions published and counting!</p> : null}
      </div>
      {this.context.user ? null : this.renderMarketingSections()}
    </div>);
  }
  render() {
    return (<div>
      <Helmet meta={[{ property: 'og:title', content: 'Open Sessions' }, { property: 'description', content: 'Open Sessions is your gateway to the most popular physical activity finders on the web.' }]} />
      <NotificationBar zIndex={4} />
      {this.renderLandingPage()}
      <Authenticated>
        <div className={styles.container}>
          {this.renderSessionList()}
        </div>
      </Authenticated>
    </div>);
  }
}
