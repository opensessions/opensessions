import React from 'react';
import { Link } from 'react-router';

import { apiFetch } from '../../utils/api';

import SessionTileView from '../SessionTileView';
import LoadingMessage from 'components/LoadingMessage';

import styles from './styles.css';

export default class OrganizerView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    router: React.PropTypes.object,
    organizer: React.PropTypes.object,
    params: React.PropTypes.object,
    unassignedSessions: React.PropTypes.array,
    organizerList: React.PropTypes.array,
    onOrganizerChange: React.PropTypes.func,
  }
  static contextTypes = {
    user: React.PropTypes.object,
    router: React.PropTypes.object,
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
        if (!res.error) {
          self.setState({ organizer: res.instance });
        } else {
          self.setState({ error: res.error });
        }
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.organizer) {
      this.setState({ organizer: nextProps.organizer });
    }
  }
  isOwner() {
    const { user } = this.context;
    const { organizer } = this.state;
    return user && organizer && organizer.owner === user.user_id;
  }
  toggleSessions = () => {
    this.setState({ showSessions: !this.state.showSessions });
  }
  renameOrganizer = (name) => {
    if (typeof name === 'string') {
      const { organizer } = this.state;
      const options = { body: { name } };
      if (options.body.name) {
        apiFetch(`/api/organizer/${organizer.uuid}`, options).then((res) => {
          const { instance, error } = res;
          Object.keys(instance).forEach((field) => {
            organizer[field] = instance[field];
          });
          if (!error) {
            this.setState({ organizer, actionState: 'none' });
          } else {
            console.error('failed to rename organizer, ', error);
            this.setState({ actionState: 'none' });
          }
        });
      }
    } else {
      this.setState({ actionState: 'rename' });
    }
  }
  deleteOrganizer = () => {
    const self = this;
    const { organizer } = this.state;
    apiFetch(`/api/organizer/${organizer.uuid}/delete`).then((res) => {
      if (res.status === 'success') {
        (self.props.router ? self.props.router : self.context.router).push('/');
      } else {
        console.error('failed to delete organizer, ', res.error);
      }
    });
  }
  renameEvents = (event) => {
    const { type, keyCode, target } = event;
    console.log('renameEvents', type, keyCode, target.value);
    if (type === 'keydown') {
      if (keyCode === 13) {
        this.setState({ actionState: 'renaming' });
        console.log('renameEvents', this.state);
        this.renameOrganizer(target.value);
      }
    } else if (type === 'blur') {
      this.setState({ actionState: 'none' });
    }
  }
  renderUnassignedSessions() {
    const sessions = this.props.unassignedSessions;
    if (!sessions) return null;
    const { showSessions } = this.state;
    const linkProps = { className: styles.toggle, onClick: this.toggleSessions };
    let unassignedSessions;
    if (!showSessions) {
      unassignedSessions = <a {...linkProps}>{sessions.length} {sessions.length === 1 ? 'session is' : 'sessions are'} currently unassigned to an organizer</a>;
    } else {
      unassignedSessions = (<div>
        <p><a {...linkProps}>Hide unassigned sessions</a></p>
        <ul className={styles.organizerList}>
          {sessions.map((session) => <li key={session.uuid}><SessionTileView session={session} /></li>)}
        </ul>
      </div>);
    }
    return (<div className={styles.unassigned}>
      {unassignedSessions}
    </div>);
  }
  renderOrganizerSelect() {
    const { organizerList } = this.props;
    if (!organizerList) return null;
    return (<select onChange={this.props.onOrganizerChange}>
      <option>Select organizer</option>
      {organizerList.map((organizer) => <option key={organizer.uuid} value={organizer.uuid}>{organizer.name}</option>)}
    </select>);
  }
  renderSessions() {
    const { organizer } = this.state;
    if (!organizer) return null;
    const sessions = organizer.Sessions;
    let sessionsDisplay = <li>No sessions yet <a onClick={this.deleteOrganizer}>delete this organizer</a></li>;
    if (sessions.length) sessionsDisplay = sessions.map((session) => (<li key={session.uuid}><SessionTileView session={session} /></li>));
    let newSessionLink = null;
    if (this.isOwner()) {
      newSessionLink = (<li className={styles.new}>
        <Link to={`/session/add?OrganizerUuid=${organizer.uuid}`}><b>+</b> Add {sessions.length ? 'another' : 'a'} session</Link>
      </li>);
    }
    return (<div className={styles.sessions}>
      <h2>{organizer.name}&rsquo;{organizer.name[organizer.name.length - 1] !== 's' ? 's' : ''} Sessions</h2>
      <ol className={styles.sessionsList}>
        {sessionsDisplay}
        {newSessionLink}
      </ol>
      {this.isOwner() ? this.renderUnassignedSessions() : null}
    </div>);
  }
  renderName(organizer) {
    if (this.state.actionState && this.state.actionState === 'rename') return <input defaultValue={organizer.name} onKeyDown={this.renameEvents} onBlur={this.renameEvents} autoFocus />;
    return [<Link to={organizer.href}>{organizer.name}</Link>, ' ', this.isOwner() ? <a onClick={this.renameOrganizer} className={styles.rename}>(rename)</a> : null];
  }
  renderOrganizer(organizer) {
    const imageUrl = '/images/organizer-bg-default.png';
    return (<div>
      <div className={styles.bannerImage} style={{ background: `url(${imageUrl}) no-repeat`, backgroundSize: 'cover' }}>
        <div className={styles.container}>
          <a className={styles.upload}>Update photo (coming soon)</a>
        </div>
      </div>
      <div className={styles.name}>
        <div className={styles.container}>
          <h1>{this.renderName(organizer)}</h1>
          {this.renderOrganizerSelect()}
        </div>
      </div>
    </div>);
  }
  render() {
    const { organizer } = this.state;
    return (<div className={styles.organizerView}>
      {organizer ? this.renderOrganizer(organizer) : <LoadingMessage message={this.state.error} />}
      <div className={styles.container}>
        {this.renderSessions()}
      </div>
    </div>);
  }
}
