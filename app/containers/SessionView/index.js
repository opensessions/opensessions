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
    return moment(date).format('dddd D MMM');
  }
  renderActions() {
    const user = this.context ? this.context.user : false;
    const session = this.state.session || {};
    const actions = [];
    if (user && user.user_id === session.owner) {
      actions.push(<Link to={`/session/${session.uuid}/edit`}>Edit</Link>);
    }
    return (<div>
      {actions}
    </div>);
  }
  renderDetails() {
    const session = this.state.session;
    return (<div className={styles.detailsSection}>
      <img />
      <div>
        <h2>{session.displayName}</h2>
        <div>{session.location}</div>
        <div>{this.date()} at {session.startTime}</div>
        <div>from £{session.price}</div>
        <div><Link to={session.Organizer.href}>Contact organizer</Link></div>
      </div>
    </div>);
  }
  renderDescription() {
    const session = this.state.session;
    return (<div className={styles.descriptionSection}>
      <div className={styles.mainCol}>
        <h3>Description</h3>
        <div className={styles.description}>
          {session.description}
        </div>
        <h4>Session meeting point</h4>
        <div>{session.meetingPoint}</div>
        <h4>What you'll need</h4>
        <div>{session.preparation}</div>
      </div>
      <div className={styles.sideCol}>
        <h4>Pricing</h4>
        <div className={styles.floatingInfo}>
          General £{session.price}
        </div>
        <h4>Session Leader</h4>
        <div className={styles.floatingInfo}>
          {session.leader}
        </div>
        <h4>Organiser</h4>
        <div className={styles.floatingInfo}>
          {session.organizer}
        </div>
      </div>
    </div>);
  }
  renderSession() {
    const session = this.state.session;
    let organizer = null;
    if (!session) return null;
    if (session.Organizer) {
      organizer = (<p>Organizer: <Link to={session.Organizer.href}>{session.Organizer.name}</Link></p>);
    }
    return (<div>
      <h1>View session: {session.displayName}</h1>
      {organizer}
      <p>{session.description}</p>
    </div>);
  }
  render() {
    return (
      <div className={styles.sessionView}>
        {this.renderActions()}
        {this.renderDetails()}
        <div className={styles.shareSection}>
          <div className={styles.inner}>Share this session</div>
        </div>
        {this.renderDescription()}
      </div>
    );
  }
}
