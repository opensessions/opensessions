import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import GoogleMapLoader from 'react-google-maps/lib/GoogleMapLoader';
import GoogleMap from 'react-google-maps/lib/GoogleMap';
import Marker from 'react-google-maps/lib/Marker';
import Helmet from 'react-helmet';

import NotificationBar from '../../components/NotificationBar';
import SocialShareIcons from '../../components/SocialShareIcons';
import LoadingMessage from '../../components/LoadingMessage';
import PublishHeader from '../../components/PublishHeader';

import { parseSchedule, sortSchedule } from '../../utils/calendar';
import { apiModel } from '../../utils/api';

import styles from './styles.css';
import publishStyles from '../../components/PublishHeader/styles.css';

export default class SessionView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: PropTypes.object,
    notifications: PropTypes.array,
    notify: PropTypes.func,
    store: PropTypes.object
  };
  static propTypes = {
    params: PropTypes.object,
    location: PropTypes.object
  };
  static fetchData = (dispatch, params) => apiModel.get('session', params.uuid).then(result => {
    const { error, instance } = result;
    if (error) throw error;
    dispatch({ type: 'SESSION_LOADED', payload: instance });
  }).catch(console.error)
  constructor() {
    super();
    this.state = {};
  }
  componentDidMount() {
    this.fetchDataClient(this.context.store.dispatch, this.props.params);
  }
  getPrice() {
    let { price } = this.context.store.getState().get('session');
    if (!price) return 'Free';
    if (price !== Math.floor(price)) {
      const minor = `0${Math.ceil((price % 1) * 100)}`.slice(-2);
      const major = Math.floor(price);
      price = `${major}.${minor}`;
    }
    return `£${price}`;
  }
  getSessionImage() {
    const { user } = this.context;
    const session = this.context.store.getState().get('session');
    if (user && user.user_id === session.owner) return `${session.image}?${Date.now().toString().slice(0, -3)}`;
    return session.image;
  }
  getTitle() {
    const session = this.context.store.getState().get('session');
    return session.title || <i>Untitled</i>;
  }
  getActions() {
    const { location } = this.props;
    const session = this.context.store.getState().get('session');
    const actions = [];
    if (this.canEdit()) {
      let editURL = `/session/${session.uuid}/edit`;
      if (location && location.query && location.query.tab) editURL = [editURL, location.query.tab].join('/');
      actions.push(<Link key="edit" to={editURL} className={publishStyles.previewButton}>{session.state === 'published' ? 'Unpublish and edit' : 'Continue editing'}</Link>);
    }
    if (!actions.length) return null;
    return actions;
  }
  canEdit() {
    const user = this.context ? this.context.user : false;
    const session = this.context.store.getState().get('session');
    return user && session && user.user_id === session.owner;
  }
  fetchDataClient = (dispatch, params) => {
    this.setState({ isLoading: true });
    return apiModel.get('session', params.uuid).then(result => {
      const { error, instance } = result;
      if (error) throw error;
      dispatch({ type: 'SESSION_LOADED', payload: instance });
      this.setState({ session: instance, isLoading: false });
      if (this.context.setMeta) {
        const { image } = instance;
        if (image) this.context.setMeta([{ property: 'og:image', content: image }]);
      }
    }).catch(() => {
      this.context.notify('Failed to load session', 'error');
      this.setState({ isLoading: false });
    });
  }
  renderDate() {
    const session = this.context.store.getState().get('session');
    const { schedule } = session;
    const sorted = sortSchedule(schedule).map(parseSchedule).filter(slot => (slot.date || slot.time) && !slot.hasOccurred);
    if (!sorted.length) return null;
    const LIMIT = 2;
    const scheduleItems = this.state.scheduleItems || LIMIT;
    return (<div className={styles.dateDetail}>
      <img src="/images/calendar.svg" role="presentation" />
      <ol className={styles.dateList}>
        {sorted.slice(0, scheduleItems).map((slot, index) => <li className={[styles.detailText, index === 0 ? styles.nextOccurring : ''].join(' ')}>
          {slot.date} {slot.time ? <span className={styles.timespan}>at {slot.time}</span> : null}
          {index === 0 || slot.duration !== sorted[index - 1].duration ? <span className={styles.duration}><img src="/images/clock.svg" role="presentation" />{slot.duration}</span> : null}
        </li>)}
        {sorted.length > LIMIT ? <li onClick={() => this.setState({ scheduleItems: scheduleItems >= sorted.length ? LIMIT : Math.min(scheduleItems + 3, sorted.length) })} className={styles.expandSchedule}>{scheduleItems >= sorted.length ? 'Show fewer dates ▴' : 'Show more dates ▾'}</li> : null}
      </ol>
    </div>);
  }
  renderDetails() {
    const session = this.context.store.getState().get('session');
    let organizerButton = null;
    if (session.Organizer) {
      organizerButton = <div className={styles.contactButton}><Link to={session.Organizer.href}>View organiser</Link></div>;
    }
    let locationDetail = null;
    if (session.location) {
      const locationPieces = session.location.split(',');
      let { location } = session;
      if (locationPieces.length > 1) {
        const firstLine = locationPieces.shift();
        location = <span className={styles.detailText}>{firstLine}<br />{locationPieces.join(',')}</span>;
      }
      locationDetail = (<div className={styles.locationDetail}>
        <img src="/images/map-pin.svg" role="presentation" />
        {location}
      </div>);
    }
    return (<div className={styles.detailsSection}>
      <div className={styles.detailsImg}>
        <img src={session.image ? this.getSessionImage() : '/images/placeholder.png'} role="presentation" />
      </div>
      <div className={styles.detailsText}>
        <h1>{this.getTitle()}{session.state === 'published' ? null : <span className={styles.state}>(draft)</span>}</h1>
        {locationDetail}
        {this.renderDate()}
        <div className={styles.detailPrice}>
          <img src="/images/tag.svg" role="presentation" />
          <b>{this.getPrice()}</b>
        </div>
        {organizerButton}
      </div>
      <Helmet meta={[{ property: 'og:image', content: session.image }]} />
    </div>);
  }
  renderDescription() {
    const session = this.context.store.getState().get('session');
    let meetingPoint = null;
    if (session.meetingPoint) {
      meetingPoint = (<div className={styles.infoSection}>
        <h3>Session meeting point</h3>
        <div className={styles.description}>
          {session.meetingPoint}
        </div>
      </div>);
    }
    let preparation = null;
    if (session.preparation) {
      preparation = (<div className={styles.infoSection}>
        <h3>What you'll need</h3>
        <div className={styles.description}>
          {session.preparation}
        </div>
      </div>);
    }
    return (<div className={styles.descriptionSection}>
      <div className={styles.mainCol}>
        <h2>Description</h2>
        <div className={styles.description}>
          {session.description || <i>This session has no description</i>}
        </div>
        {meetingPoint}
        {preparation}
      </div>
      <div className={styles.sideCol}>
        <div className={styles.info}>
          <h3>Pricing</h3>
          <div className={`${styles.floatingInfo} ${styles.pricing}`}>
            <span className={styles.label}>{session.attendanceType || 'General'}</span>
            <span className={styles.price}>
              <img src="/images/tag.svg" role="presentation" />
              {this.getPrice()}
            </span>
          </div>
        </div>
        {session.leader ? (<div className={styles.info}>
          <h3>Session Leader</h3>
          <div className={styles.floatingInfo}>
            {session.leader}
          </div>
        </div>) : null}
        <div className={styles.info}>
          <h3>Organiser</h3>
          <div className={`${styles.floatingInfo} ${styles.organizerInfo}`}>
            <p>{session.Organizer ? (<Link to={session.Organizer.href}>{session.Organizer.name}</Link>) : 'No organizer'}</p>
            <p>{session.contactPhone ? (<a className={styles.organizerLink} href={`tel:${session.contactPhone}`}><img src="/images/phone.svg" role="presentation" /> {session.contactPhone}</a>) : ''}</p>
            <p>{session.contactEmail ? (<a className={styles.organizerLink} href={`mailto:${session.contactEmail}`}><img src="/images/email.png" role="presentation" /> {session.contactEmail}</a>) : ''}</p>
            <ol className={styles.socialLinks}>
              {session.socialWebsite ? <li><a className={styles.organizerLink} href={session.socialWebsite}>{session.socialWebsite}</a></li> : null}
              {session.socialFacebook ? <li><a className={styles.organizerLink} href={session.socialFacebook}><img src="/images/facebook.png" role="presentation" /> Facebook page</a></li> : null}
              {session.socialInstagram ? <li><a className={styles.organizerLink} href={`https://instagram.com/${session.socialInstagram.slice(1)}`}><img src="/images/instagram.png" role="presentation" /> {session.socialInstagram}</a></li> : null}
              {session.socialTwitter ? <li><a className={styles.organizerLink} href={`https://twitter.com/${session.socialTwitter.slice(1)}`}><img src="/images/twitter.png" role="presentation" /> {session.socialTwitter}</a></li> : null}
              {session.socialHashtag ? <li><a className={styles.organizerLink} href={`https://twitter.com/hashtag/${session.socialHashtag.slice(1)}`}>{session.socialHashtag}</a></li> : null}
            </ol>
          </div>
        </div>
        <div className={styles.info}>
          <h3>Disability Support</h3>
          <div className={`${styles.floatingInfo} ${styles.disabilityInfo}`}>
            {(session.abilityRestriction && session.abilityRestriction.length)
              ? session.abilityRestriction.map(ability => <p key={ability}>{ability} <img src="/images/tick.svg" role="presentation" /></p>)
              : <p>No disabilities supported</p>}
          </div>
        </div>
      </div>
    </div>);
  }
  renderAbout() {
    const session = this.context.store.getState().get('session');
    let features = [];
    const maps = {
      genderRestriction: {
        male: {
          text: 'Male Only',
          iconImg: '/images/male-selected.svg'
        },
        female: {
          text: 'Female Only',
          iconImg: '/images/female-selected.svg'
        },
        mixed: {
          text: 'Mixed Gender',
          iconImg: '/images/mixed-selected.svg'
        }
      },
      hasCoaching: {
        true: {
          iconImg: '/images/coached.png',
          text: 'Coached'
        }
      }
    };
    features = features.concat(Object.keys(maps).filter(key => session[key] && session[key] in maps[key]).map(key => maps[key][session[key]]));
    features = features.concat(['min', 'max'].filter(extremum => session[`${extremum}AgeRestriction`]).map(extremum => ({
      iconText: session[`${extremum}AgeRestriction`],
      text: `${extremum}imum Age`
    })));
    return (<div className={styles.aboutSection}>
      <div className={styles.inner}>
        <h2>About this session</h2>
        <ol>
          {features.map(feature => (<li key={feature.text}>
            {feature.iconImg
              ? <span><img className={styles.iconImg} src={feature.iconImg} role="presentation" /><br /></span>
              : <span className={styles.iconText}>{feature.iconText}</span>}
            {feature.text}
          </li>))}
        </ol>
      </div>
    </div>);
  }
  renderMap() {
    const session = this.context.store.getState().get('session');
    const { locationData } = session;
    let map = null;
    let address = null;
    if (locationData) {
      const locData = typeof locationData === 'object' ? locationData : JSON.parse(locationData);
      const defaultCenter = { lat: locData.lat, lng: locData.lng };
      const onMapClick = () => true;
      const marker = {
        position: defaultCenter,
        icon: { url: '/images/map-pin-active.svg' },
        defaultAnimation: 2
      };
      const googleMap = {
        ref: 'map',
        defaultZoom: 16,
        defaultCenter,
        onClick: onMapClick,
        options: {
          streetViewControl: false, scrollwheel: false,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT
          },
          mapTypeControl: false
        }
      };
      map = (<div className={styles.mapFrame}>
        <GoogleMapLoader
          containerElement={<div style={{ height: '100%' }} />}
          googleMapElement={<GoogleMap {...googleMap}>
            <Marker {...marker} />
          </GoogleMap>}
        />
      </div>);
      address = <div className={styles.address}>{session.location.split(',').map(line => <p key={line}>{line}</p>)}</div>;
    } else {
      map = (<div className={styles.noLocation}>
        <img src="/images/map-pin.svg" role="presentation" />
        No location data
      </div>);
    }
    return (<section className={styles.mapSection}>
      {address}
      {map}
    </section>);
  }
  renderShare() {
    const session = this.context.store.getState().get('session');
    const { title, href } = session;
    const link = `${process.env.SERVICE_LOCATION}${href}`;
    const disabled = session.state !== 'published';
    return (<div className={[styles.shareSection, disabled ? styles.disabled : null].join(' ')}>
      <div className={styles.inner}>
        Share this session
        {disabled ? <sub> (enabled when published)</sub> : null}
        <SocialShareIcons link={link} title={title} message="I found this cool session on Open Sessions! Wanna go?" />
      </div>
    </div>);
  }
  renderSession() {
    return (<div>
      {this.renderDetails()}
      {this.renderShare()}
      {this.renderDescription()}
      {this.renderAbout()}
      {this.renderMap()}
    </div>);
  }
  render() {
    const { isLoading } = this.state;
    const session = this.context.store.getState().get('session');
    if (isLoading) return (<div className={styles.sessionView}><LoadingMessage message="Loading session" ellipsis /></div>);
    return (<div className={styles.sessionView}>
      {this.canEdit() ? <PublishHeader h2={session && session.state === 'published' ? 'Published session' : 'Preview'} actions={this.getActions()} /> : null}
      <NotificationBar notifications={this.context.notifications} />
      {session ? this.renderSession() : <LoadingMessage message="Session not found" />}
    </div>);
  }
}
