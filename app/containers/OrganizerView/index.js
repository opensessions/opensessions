import React from 'react';
import { Link } from 'react-router';

import { apiFetch } from '../../utils/api';

import SessionTileView from '../SessionTileView';

import styles from './styles.css';

export default class OrganizerView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    organizer: React.PropTypes.object,
    params: React.PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.state = {
      organizer: props.organizer || null,
    };
  }
  componentDidMount() {
    const self = this;
    let uuid;
    if (this.props.params && this.props.params.uuid) {
      uuid = this.props.params.uuid;
      apiFetch(`/api/organizer/${uuid}`).then((res) => {
        self.setState({ organizer: res.instance });
      });
    }
  }
  renderSessions() {
    const { organizer } = this.state;
    if (!organizer) return null;
    if (!organizer.Sessions.length) return <p>No sessions</p>;
    return (<div className={styles.sessions}>
      <h2>{organizer.name}&rsquo;{organizer.name[organizer.name.length - 1] !== 's' ? 's' : ''} Sessions</h2>
      <ol className={styles.sessionsList}>
        {organizer.Sessions.map((session) => (<li key={session.uuid}><SessionTileView session={session} /></li>))}
        <li className={styles.new}>
          <Link to={`/session/add?OrganizerUuid=${organizer.uuid}`}><b>+</b> Add another session</Link>
        </li>
      </ol>
    </div>);
  }
  renderOrganizer() {
    const { organizer } = this.state;
    if (!organizer) return null;
    const imageUrl = '/images/organizer-bg-default.png';
    return (<div>
      <div className={styles.bannerImage} style={{ background: `url(${imageUrl}) no-repeat`, backgroundSize: 'cover' }}>
        <div className={styles.container}>
          <a className={styles.upload}>Update photo (coming soon)</a>
        </div>
      </div>
      <div className={styles.name}>
        <div className={styles.container}>
          <h1><Link to={organizer.href}>{organizer.name}</Link></h1>
        </div>
      </div>
    </div>);
  }
  render() {
    return (<div className={styles.organizerView}>
      {this.renderOrganizer()}
      <div className={styles.container}>
        {this.renderSessions()}
      </div>
    </div>);
  }
}
