import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { apiModel } from '../../utils/api';

import SessionTileView from '../SessionTileView';
import SessionList from '../SessionList';

import ItemMap from '../../components/ItemMap';
import Button from '../../components/Button';
import LoadingMessage from '../../components/LoadingMessage';
import NotificationBar from '../../components/NotificationBar';
import SessionMini from '../../components/SessionMini';
import CalendarView from '../../components/CalendarView';
import ImageUpload from '../../components/Fields/ImageUpload';
import PagedList from '../../components/PagedList';
import SocialMedia from '../../components/SocialMedia';

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
    store: PropTypes.object,
    onExpire: PropTypes.func
  }
  constructor() {
    super();
    this.state = {};
  }
  componentDidMount() {
    if (this.props.params) this.fetchData();
  }
  getOrganizer() {
    return this.state && this.state.organizer ? this.state.organizer : this.props.organizer;
  }
  fetchData = () => {
    const { params } = this.props;
    const uuid = params ? params.uuid : this.state.organizer.uuid;
    this.setState({ isLoading: true });
    return apiModel.get('organizer', uuid, { depth: 1 }).then(res => {
      this.setState({ organizer: res.instance, isLoading: false });
    }).catch(() => {
      this.setState({ isLoading: false });
      this.context.notify('Failed to retrieve organiser', 'error');
    });
  }
  photoChange = image => {
    const organizer = this.getOrganizer();
    return apiModel.edit('organizer', organizer.uuid, { image }).then(() => {
      this.setState({ modified: Date.now() });
      this.fetchData();
    }).catch(() => {
      this.context.notify('Couldn\'t change the image', 'error');
    });
  }
  canAct(action) {
    const organizer = this.getOrganizer();
    return organizer && organizer.actions.some(name => name === action);
  }
  toggleSessions = () => {
    this.setState({ showSessions: !this.state.showSessions });
  }
  renameOrganizer = name => {
    if (typeof name === 'string') {
      const organizer = this.getOrganizer();
      if (name === organizer.name) return;
      const options = { name };
      if (options.name) {
        apiModel.edit('organizer', organizer.uuid, options).then(res => {
          const { instance, error } = res;
          if (error) throw new Error('failed to rename organiser');
          this.context.notify('Organiser successfully renamed!', 'success');
          this.context.router.push(instance.href);
          this.setState({ actionState: 'none' });
          this.fetchData();
        }).catch(() => {
          this.context.notify('Couldn\'t rename organiser', 'error');
          this.setState({ actionState: 'none' });
        });
      }
    } else {
      this.setState({ actionState: 'rename' });
    }
  }
  deleteOrganizer = () => {
    const organizer = this.getOrganizer();
    return apiModel.delete('organizer', organizer.uuid).then(res => {
      if (res.status === 'success') {
        this.context.notify('Organiser deleted!', 'success');
        this.context.onExpire();
      }
    }).catch(err => {
      console.log(err);
      this.context.notify('Couldn\'t delete organiser', 'error');
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
    const { showSessions, isLoading } = this.state;
    const linkProps = { className: styles.toggle, onClick: this.toggleSessions };
    let text = 'Hide unassigned sessions';
    if (!showSessions) text = `${unassignedSessions.length} session${unassignedSessions.length === 1 ? ' is' : 's are'} currently unassigned to an organizer`;
    return (<div className={styles.unassigned}>
      <p><a {...linkProps}>{text}</a></p>
      {showSessions && !isLoading ? <SessionList sessions={unassignedSessions} /> : null}
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
    const organizer = this.getOrganizer();
    if (!organizer) return null;
    const sessions = organizer.Sessions || [];
    return (<div className={styles.sessions}>
      <h2>{organizer.name}&rsquo;{organizer.name[organizer.name.length - 1] !== 's' ? 's' : ''} Sessions</h2>
      {sessions.length
        ? <PagedList items={sessions} Component={SessionTileView} page={1} limit={6} orientation="bottom" itemToProps={session => ({ session })} />
        : <p>No sessions yet {this.canAct('delete') ? <Button style="danger" onClick={this.deleteOrganizer}>delete this organiser</Button> : null}</p>}
      {this.canAct('edit') ? <p className={styles.new}><Button to={`/session/add?OrganizerUuid=${organizer.uuid}`}><b>+</b> Add {sessions.length ? 'another' : 'a'} session</Button></p> : null}
      {this.canAct('edit') ? this.renderUnassignedSessions() : null}
    </div>);
  }
  renderName(organizer) {
    if (this.state.actionState && this.state.actionState === 'rename') return <input defaultValue={organizer.name} onKeyDown={this.renameEvents} onBlur={this.renameEvents} autoFocus />;
    return (<span>
      <Link to={organizer.href}>{organizer.name}</Link> {this.canAct('edit') ? <a onClick={this.renameOrganizer} onKeyUp={event => event.keyCode === 13 && this.renameOrganizer()} className={styles.rename} tabIndex={0}><img src="/images/change.png" alt="edit" /></a> : null}
    </span>);
  }
  renderUploadPhoto() {
    const organizer = this.getOrganizer();
    return <ImageUpload value={organizer.image} onChange={this.photoChange} preview={false} addText="Update photo" upload={{ URL: `/api/organizer/${organizer.uuid}/image`, name: 'image' }} />;
  }
  renderOrganizer(organizer) {
    const { modified } = this.state;
    const imageUrl = organizer.image ? `${organizer.image}${modified ? `?${modified}` : ''}` : '/images/organizer-bg-default.png';
    return (<div className={styles.banner}>
      <div className={styles.bannerImage} style={{ backgroundImage: `url(${imageUrl})` }}>
        <div className={styles.container}>
          {this.canAct('edit') ? this.renderUploadPhoto() : null}
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
  renderMembers(organizer) {
    if (!organizer) return null;
    const { uuid, members } = organizer;
    const removeMember = member => apiModel.action('Organizer', uuid, 'removeMember', { user_id: member.user_id }).then(() => {
      this.context.notify('Member removed', 'success');
      this.fetchData();
    }).catch(() => this.context.notify('Could not remove member', 'error'));
    const addMember = () => {
      const email = prompt('Enter an email');
      if (email) {
        apiModel.action('Organizer', uuid, 'addMember', { email }).then(() => {
          this.context.notify('Member added', 'success');
          this.fetchData();
        }).catch(() => this.context.notify('User does not exist', 'error'));
      }
    };
    return (<div className={styles.members}>
      <h2>Members</h2>
      <div className={styles.memberContent}>
        <p><i>Other Open Sessions users who can edit <b>{organizer.name}</b>'s sessions</i></p>
        <ol>
          {members && members.length ? members.map((member, key) => <li key={key}>{member.picture ? <img src={member.picture} role="presentation" /> : null} {member.name || member.email} {this.canAct('removeMember') ? <Button onClick={() => removeMember(member)} style="danger">remove</Button> : null}</li>) : <li><i>No other members currently</i></li>}
        </ol>
        <p>{this.canAct('addMember') ? <Button onClick={() => addMember()}>Add a member</Button> : null}</p>
      </div>
    </div>);
  }
  renderData(organizer, canEdit) {
    let { data } = organizer;
    const { info } = organizer;
    if (!data) data = {};
    if (!canEdit && !Object.keys(data).length) return null;
    const { description, location } = data;
    return (<div className={styles.organizerData}>
      <h2>Organiser Info</h2>
      {description || info ? null : <i>No additional info yet</i>}
      <p className={styles.description}>{description || <i>No description</i>}</p>
      {info.contact.name ? <p><b>Contact</b> {info.contact.name}</p> : null}
      {info.contact.phone ? <p><b>Phone</b> <a href={`tel:${info.contact.phone}`}>{info.contact.phone}</a></p> : null}
      {location ? (<div>
        <ItemMap markers={[{ ...location.data, isActive: true, box: () => <p>{location.address}</p> }]} size={0} />
        <p><b>Location</b> {location.address}</p>
      </div>) : null}
      <br />
      <SocialMedia item={organizer.info} />
      {this.canAct('edit') && canEdit ? <p><Button to={`${organizer.href}/edit`} style="slim"><img src="/images/change.png" alt="edit" style={{ filter: 'invert()' }} /> Edit</Button></p> : null}
    </div>);
  }
  renderCalendar(organizer) {
    const renderItem = s => <SessionMini session={s} />;
    return (<div>
      <CalendarView items={organizer.Sessions} itemToDates={i => i.sortedSchedule.map(s => new Date(s.start))} month={(new Date()).toISOString().substr(0, 7)} renderItem={renderItem} />
    </div>);
  }
  render() {
    const organizer = this.getOrganizer();
    const { user } = this.context;
    const isAdmin = user && user.email && user.email.indexOf(`@${window.ADMIN_DOMAIN}`) !== -1;
    return (<div className={styles.organizerView}>
      <NotificationBar zIndex={3} />
      {organizer ? this.renderOrganizer(organizer) : <LoadingMessage message="Loading organiser" ellipsis />}
      <div className={styles.container}>
        {this.renderSessions()}
        <div className={styles.sidebar}>
          {organizer ? this.renderData(organizer, isAdmin) : null}
          {organizer && this.canAct('edit') ? this.renderMembers(organizer) : null}
        </div>
      </div>
      {organizer && isAdmin ? this.renderCalendar(organizer) : null}
    </div>);
  }
}
