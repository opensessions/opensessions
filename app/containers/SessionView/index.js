import React from 'react';
import moment from 'moment';

import { Link } from 'react-router';

import { apiFetch } from '../../utils/api';

import styles from './styles.css';

export default class SessionView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: React.PropTypes.object,
  }
  static propTypes = {
    params: React.PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.state = {
      session: null,
    };
  }
  componentDidMount() {
    const self = this;
    apiFetch(`/api/session/${this.props.params.uuid}`)
      .then((session) => self.setState({ session }));
  }
  date() {
    const date = new Date(this.state.session.startDate);
    const time = new Date(this.state.session.startTime);
    return `${moment(date).format('dddd D MMM')} at ${moment(time).format('H:mm')}`;
  }
  renderActions() {
    const user = this.context ? this.context.user : false;
    const session = this.state.session || {};
    const actions = [];
    if (user && user.user_id === session.owner) {
      actions.push(<Link to={`/session/${session.uuid}/edit`}>Edit</Link>);
    }
    return (<div className={styles.actions}>
      {actions}
    </div>);
  }
  renderDetails() {
    const session = this.state.session;
    let organizerButton = null;
    if (session.Organizer) {
      organizerButton = <div className={styles.contactButton}><Link to={session.Organizer.href}>Contact organizer</Link></div>;
    }
    return (<div className={styles.detailsSection}>
      <div className={styles.detailsImg}>
        <img role="presentation" />
      </div>
      <div className={styles.detailsText}>
        {this.renderActions()}
        <h1>{session.displayName}</h1>
        <div className={styles.detail}>
          {session.location}
        </div>
        <div className={styles.detail}>
          {this.date()}
        </div>
        <div className={styles.detailPrice}>
          from £{session.price}
        </div>
        {organizerButton}
      </div>
    </div>);
  }
  renderDescription() {
    const session = this.state.session;
    return (<div className={styles.descriptionSection}>
      <div className={styles.mainCol}>
        <h2>Description</h2>
        <div className={styles.description}>
          {session.description}
        </div>
        <h3>Session meeting point</h3>
        <div>{session.meetingPoint}</div>
        <h3>What you'll need</h3>
        <div>{session.preparation}</div>
      </div>
      <div className={styles.sideCol}>
        <h3>Pricing</h3>
        <div className={styles.floatingInfo}>
          General £{session.price}
        </div>
        <h3>Session Leader</h3>
        <div className={styles.floatingInfo}>
          {session.leader}
        </div>
        <h3>Organiser</h3>
        <div className={styles.floatingInfo}>
          {session.Organizer ? (<Link to={session.Organizer.href}>{session.Organizer.name}</Link>) : 'No organizer'}
        </div>
      </div>
    </div>);
  }
  renderAbout() {
    const session = this.state.session;
    const features = [];
    if (session.hasCoaching) features.push('Coached');
    return (<div>
      <h2>About this session</h2>
      <p>Detail about requirements etc, coming soon</p>
      <ol>
        {features.map((feature) => <li>{feature}</li>)}
      </ol>
    </div>);
  }
  renderMap() {
    return (<div>Coming soon</div>);
  }
  render() {
    if (this.state.session === null) return (<div>Loading</div>);
    return (
      <div className={styles.sessionView}>
        {this.renderDetails()}
        <div className={styles.shareSection}>
          <div className={styles.inner}>Share this session</div>
        </div>
        {this.renderDescription()}
        {this.renderAbout()}
        {this.renderMap()}
      </div>
    );
  }
}
