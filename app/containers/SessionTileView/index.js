import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import CalendarSVG from '../../components/SVGs/Calendar';

import { parseSchedule, sortSchedule } from '../../utils/calendar';
import { apiModel } from '../../utils/api';

import styles from './styles.css';

const SessionTileView = function (props, context) {
  const { session, style } = props;
  const { notify, modal, router, onExpire, user } = context;
  const isOwner = user && session.owner === user.user_id;
  const confirmAction = action => modal.confirm(<span>Are you sure you want to {action} <b>{session.title || 'this session'}</b>?</span>, () => apiModel.action('session', session.uuid, action).then(res => {
    const { message, messageType, redirect } = res;
    if (res.status === 'success') {
      if (message) notify(message, messageType || 'success');
      if (redirect) router.push(redirect);
      onExpire();
    } else {
      throw new Error(`Failed to ${action} session`);
    }
  }).catch(() => {
    notify(`Failed to ${action} session`, 'error');
  }));
  const renderActions = () => {
    const actionTypes = {
      edit: <Link to={`${session.href}/edit`}>Edit</Link>,
      view: <Link to={session.href}>View</Link>,
      duplicate: <a onClick={() => confirmAction('duplicate')} onKeyUp={({ keyCode, target }) => keyCode === 13 && target.click()} tabIndex={0}>Duplicate</a>,
      delete: <a onClick={() => confirmAction('delete')} onKeyUp={({ keyCode, target }) => keyCode === 13 && target.click()} tabIndex={0} className={styles.delete}>Delete</a>
    };
    return (<ol className={styles.actions}>
      {session.actions.filter(key => key in actionTypes).map(key => <li key={key}>{actionTypes[key]}</li>)}
    </ol>);
  };
  const { title, image, aggregators } = session;
  let { state } = session;
  if (state === 'unpublished') state = 'draft';
  const isAdmin = context.isAdmin;
  return (<article className={[styles.tile, style ? styles[style] : ''].join(' ')}>
    <div className={styles.imgCol}>
      <img src={image || '/images/placeholder.png'} role="presentation" className={!image ? styles.noImage : null} />
      {isAdmin && session.analytics ? <div className={styles.moreInfo}>Viewed {session.analytics.views} times</div> : null}
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
        {session.schedule && session.schedule.length
          ? sortSchedule(session.schedule).map(parseSchedule).map((date, key) => (<li className={[styles.schedule, date.hasOccurred ? styles.occurred : null].join(' ')} key={key}>
            <CalendarSVG />
            <span>{date.date} {date.time ? <span className={styles.time}>at {date.time}</span> : null}</span>
          </li>))
          : (<li className={styles.addSchedule}>
            {isOwner
              ? <Link to={`${session.href}/edit/schedule`}><b>+</b> Add a schedule</Link>
              : 'No schedule yet'
            }
          </li>)
        }
      </ol>
    </div>
  </article>);
};
SessionTileView.propTypes = {
  session: PropTypes.object,
  style: PropTypes.string
};
SessionTileView.contextTypes = {
  user: PropTypes.object,
  modal: PropTypes.object,
  router: PropTypes.object,
  notify: PropTypes.func,
  onExpire: PropTypes.func,
  isAdmin: PropTypes.bool
};

export default SessionTileView;
