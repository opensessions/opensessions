import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import Button from '../Button';

import CalendarSVG from '../SVGs/Calendar';

import { parseSchedule, lastUpdatedString } from '../../utils/calendar';
import { apiModel } from '../../utils/api';

import styles from './styles.css';

const actionResult = ({ notify, router, onExpire }, action) => ({ message, messageType, redirect, status }) => {
  if (status === 'success') {
    if (message) notify(message, messageType || 'success');
    if (redirect) router.push(redirect);
    onExpire();
  } else if (messageType !== 'success') {
    throw new Error(`Failed to ${action} session`);
  }
};

const actionError = ({ notify }, action, object) => () => notify(`Failed to ${action} ${object}`);

const SessionTile = function (props, context) {
  const { session, style } = props;
  const { modal, user } = context;
  const isOwner = user && session.owner === user.user_id;
  const promptAction = action => modal.prompt(<span>Give a name for your duplicated session:</span>, title => apiModel.action('session', session.uuid, action, { title })
    .then(actionResult(context, action))
    .catch(actionError(context, action, 'session')), session.title);
  const confirmAction = action => modal.confirm(<span>Are you sure you want to {action} <b>{session.title || 'this session'}</b>?</span>, () => apiModel.action('session', session.uuid, action)
    .then(actionResult(context, action))
    .catch(actionError(context, action, 'session')));
  const renderActions = () => {
    const actionTypes = {
      edit: <Button style="slim" to={`${session.href}/edit`}>Edit</Button>,
      view: <Button style="slim" to={session.href}>View</Button>,
      duplicate: <Button style="slim" onClick={() => promptAction('duplicate')}>Duplicate</Button>,
      delete: <Button onClick={() => confirmAction('delete')} style={['danger', 'slim']}>Delete</Button>
    };
    return (<ol className={styles.actions}>
      {session.actions.filter(key => key in actionTypes).map(key => <li key={key}>{actionTypes[key]}</li>)}
    </ol>);
  };
  const { title, image, aggregators } = session;
  let { state } = session;
  if (state === 'unpublished') state = 'draft';
  const isAdmin = context.isAdmin;
  const [updatedAt] = lastUpdatedString(session);
  return (<article className={[styles.tile, style ? styles[style] : ''].join(' ')}>
    <div className={styles.imgCol}>
      <img src={image || '/images/placeholder.png'} role="presentation" className={!image ? styles.noImage : null} />
      {isAdmin
        ? (<div className={styles.moreInfo}>
          {session.analytics ? <span className={styles.views}>{session.analytics.views} views</span> : null}
          <span className={styles.updatedAt}>updated {updatedAt}</span>
        </div>)
        : null}
    </div>
    <div className={styles.textCol}>
      <div className={styles.info}>
        <h1>
          <Link to={session.href}>{title || <i>Untitled</i>}</Link>
          {isAdmin && aggregators ? aggregators.map(agg => <a key={agg.name} target="blank" href={agg.href} className={styles.GALLink}>{agg.name}</a>) : null}
        </h1>
        <div className={styles.location}>{session.locationData && session.locationData.manual ? session.locationData.manual.join(', ') : session.location}</div>
        {session.Activities ? <ol className={styles.activities}>{session.Activities.map(activity => <li>{activity.name}</li>)}</ol> : null}
      </div>
      <div className={styles.meta}>
        {renderActions()}
        {isOwner ? <div className={[styles.state, state === 'published' ? styles.live : ''].join(' ')}>{state}</div> : null}
      </div>
    </div>
    <div className={styles.schedules}>
      <div>{session.schedule ? session.schedule.length : 'NONE'} SCHEDULED</div>
      <ol>
        {session.sortedSchedule.length
          ? session.sortedSchedule.map(parseSchedule).map((date, key) => (<li className={[styles.schedule, date.hasOccurred ? styles.occurred : null].join(' ')} key={key}>
            <CalendarSVG />
            <span>{date.date} {date.time ? <span className={styles.time}>at {date.time}</span> : null}</span>
          </li>))
          : (<li className={styles.addSchedule}>
            {isOwner && !(session.Organizer && session.Organizer.data && session.Organizer.data.noSchedule)
              ? <Link to={`${session.href}/edit/schedule`}><b>+</b> Add a schedule</Link>
              : 'No schedule yet'
            }
          </li>)
        }
      </ol>
    </div>
  </article>);
};
SessionTile.propTypes = {
  session: PropTypes.object,
  style: PropTypes.string
};
SessionTile.contextTypes = {
  user: PropTypes.object,
  modal: PropTypes.object,
  router: PropTypes.object,
  notify: PropTypes.func,
  onExpire: PropTypes.func,
  isAdmin: PropTypes.bool
};

export default SessionTile;
