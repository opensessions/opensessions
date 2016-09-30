import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { apiModel } from '../../utils/api';

import NotificationBar from 'components/NotificationBar';
import SessionTileView from '../SessionTileView';
import LoadingMessage from 'components/LoadingMessage';
import SessionList from 'containers/SessionList';
import ImageUpload from 'components/ImageUploadField';

import styles from './styles.css';

export default class OrganizerView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    organizer: PropTypes.object,
    params: PropTypes.object,
    unassignedSessions: PropTypes.array,
    organizerList: PropTypes.array,
    onOrganizerChange: PropTypes.func,
  };
  static contextTypes = {
    user: PropTypes.object,
    router: PropTypes.object,
    notify: PropTypes.func,
    notifications: PropTypes.array,
  }
  constructor(props) {
    super(props);
    this.state = {
      organizer: props.organizer || null
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
  photoChange = image => {
    const { organizer } = this.state;
    return apiModel.edit('organizer', organizer.uuid, { image }).then(res => {
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
  renameOrganizer = name => {
    if (typeof name === 'string') {
      const { organizer } = this.state;
      const options = { name };
      if (options.name) {
        apiModel.edit('organizer', organizer.uuid, options).then(res => {
          const { instance, error } = res;
          if (error) throw new Error('failed to rename organiser');
          this.context.notify('Organiser successfully renamed!', 'success');
          this.context.router.push(instance.href);
          this.setState({ organizer: instance, actionState: 'none' });
        }).catch(error => {
          this.context.notify('Couldn\'t rename organiser', 'error');
          this.setState({ actionState: 'none', error: error.message });
        });
      }
    } else {
      this.setState({ actionState: 'rename' });
    }
  }
  deleteOrganizer = () => {
    const { organizer } = this.state;
    return apiModel.delete('organizer', organizer.uuid).then(res => {
      if (res.status === 'success') {
        this.context.notify('Organiser deleted!', 'success');
        this.context.router.push('/');
      }
    }).catch(() => {
      this.context.notify('Couldn\'t delete organiser', 'error');
      this.setState({ error: 'failed to delete organiser' });
    });
  }
  renameEvents = event => {
    const { type, keyCode, target } = event;
    if (keyCode === 13 || type === 'blur') {
      this.setState({ actionState: 'renaming' });
      this.renameOrganizer(target.value);
    }
  }
  renderUnassignedSessions() {
    const { unassignedSessions } = this.props;
    if (!(unassignedSessions && unassignedSessions.length)) return null;
    const { showSessions } = this.state;
    const linkProps = { className: styles.toggle, onClick: this.toggleSessions };
    let text = 'Hide unassigned sessions';
    if (!showSessions) text = `${unassignedSessions.length} session${unassignedSessions.length === 1 ? ' is' : 's are'} currently unassigned to an organizer`;
    return (<div className={styles.unassigned}>
      <p><a {...linkProps}>{text}</a></p>
      {showSessions ? <SessionList sessions={unassignedSessions} /> : null}
    </div>);
  }
  renderOrganizerSelect() {
    const { organizerList, onOrganizerChange } = this.props;
    if (!organizerList) return null;
    return (<select onChange={onOrganizerChange}>
      <option>Select organiser</option>
      {organizerList.map(organizer => <option key={organizer.uuid} value={organizer.uuid}>{organizer.name}</option>)}
    </select>);
  }
  renderSessions() {
    const { organizer } = this.state;
    if (!organizer) return null;
    const sessions = organizer.Sessions;
    let sessionsDisplay = <li>No sessions yet {this.isOwner() ? <a onClick={this.deleteOrganizer}>delete this organiser</a> : null}</li>;
    if (sessions && sessions.length) sessionsDisplay = sessions.map(session => <li key={session.uuid}><SessionTileView session={session} /></li>);
    let newSessionLink = null;
    if (this.isOwner()) {
      newSessionLink = (<li className={styles.new}>
        <Link to={`/session/add?OrganizerUuid=${organizer.uuid}`}><b>+</b> Add {sessions && sessions.length ? 'another' : 'a'} session</Link>
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
  renderUploadPhoto() {
    const { organizer } = this.state;
    return <ImageUpload value={organizer.image} onChange={this.photoChange} preview={false} addText="Update photo" upload={{ URL: `/api/organizer/${organizer.uuid}/image`, name: 'image' }} />;
  }
  renderOrganizer(organizer) {
    const imageUrl = organizer.image ? organizer.image : '/images/organizer-bg-default.png';
    return (<div>
      <div className={styles.bannerImage} style={{ backgroundImage: `url(${imageUrl})` }}>
        <div className={styles.container}>
          {this.isOwner() ? this.renderUploadPhoto() : null}
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
    const { organizer, error } = this.state;
    return (<div className={styles.organizerView}>
      <NotificationBar notifications={this.context.notifications} zIndex={3} />
      {organizer ? this.renderOrganizer(organizer) : <LoadingMessage message="Loading organiser" ellipsis />}
      {error ? <LoadingMessage message={error} /> : null}
      <div className={styles.container}>
        {this.renderSessions()}
      </div>
    </div>);
  }
}
