import React from 'react';
import { Link } from 'react-router';

import { apiModel } from '../../utils/api';

import SessionTileView from '../SessionTileView';
import LoadingMessage from 'components/LoadingMessage';
import SessionList from 'containers/SessionList';

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
      status: 'Loading organizer'
    };
  }
  componentDidMount() {
    if (this.props.params) this.fetchData();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.organizer) {
      this.setState({ organizer: nextProps.organizer });
    }
  }
  fetchData = () => {
    const { params } = this.props;
    return apiModel.get('organizer', params.uuid).then(res => {
      this.setState({ organizer: res.instance });
    }).catch(error => {
      this.setState({ error });
    });
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
      const options = { name };
      if (options.name) {
        apiModel.edit('organizer', organizer.uuid, options).then((res) => {
          const { instance, error } = res;
          Object.keys(instance).forEach((field) => {
            organizer[field] = instance[field];
          });
          if (!error) {
            this.setState({ organizer, actionState: 'none' });
          } else {
            this.setState({ actionState: 'none', error: 'failed to rename organizer' });
          }
        });
      }
    } else {
      this.setState({ actionState: 'rename' });
    }
  }
  deleteOrganizer = () => {
    const { organizer } = this.state;
    return apiModel.delete('organizer', organizer.uuid).then(res => {
      if (res.status === 'success') ('router' in this.props ? this.props : this.context).router.push('/');
    }).catch(() => {
      this.setState({ error: 'failed to delete organizer' });
    });
  }
  renameEvents = (event) => {
    const { type, keyCode, target } = event;
    if (type === 'keydown') {
      if (keyCode === 13) {
        this.setState({ actionState: 'renaming' });
        this.renameOrganizer(target.value);
      }
    } else if (type === 'blur') {
      this.setState({ actionState: 'none' });
    }
  }
  renderUnassignedSessions() {
    const sessions = this.props.unassignedSessions;
    if (!(sessions && sessions.length)) return null;
    const { showSessions } = this.state;
    const linkProps = { className: styles.toggle, onClick: this.toggleSessions };
    let text = 'Hide unassigned sessions';
    if (!showSessions) text = `${sessions.length} session${sessions.length === 1 ? ' is' : 's are'} currently unassigned to an organizer`;
    return (<div className={styles.unassigned}>
      <p><a {...linkProps}>{text}</a></p>
      {showSessions ? <SessionList sessions={sessions} /> : null}
    </div>);
  }
  renderOrganizerSelect() {
    const { organizerList, onOrganizerChange } = this.props;
    if (!organizerList) return null;
    return (<select onChange={onOrganizerChange}>
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
    return (<span><Link to={organizer.href}>{organizer.name}</Link> {this.isOwner() ? <a onClick={this.renameOrganizer} className={styles.rename}>(rename)</a> : null}</span>);
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
    const { organizer, error, status } = this.state;
    return (<div className={styles.organizerView}>
      {organizer ? this.renderOrganizer(organizer) : <LoadingMessage message={status} ellipsis />}
      {error ? <LoadingMessage message={error} /> : null}
      <div className={styles.container}>
        {this.renderSessions()}
      </div>
    </div>);
  }
}
