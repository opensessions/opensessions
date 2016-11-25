import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import GoogleMapLoader from 'react-google-maps/lib/GoogleMapLoader';
import GoogleMap from 'react-google-maps/lib/GoogleMap';
import Marker from 'react-google-maps/lib/Marker';
import Helmet from 'react-helmet';

import MessageModal from '../Modals/Message';
import NotificationBar from '../../components/NotificationBar';
import SocialShareIcons from '../../components/SocialShareIcons';
import LoadingMessage from '../../components/LoadingMessage';
import PublishHeader from '../../components/PublishHeader';
import PaymentSVG from '../../components/SVGs/PaymentMethod';
import PriceSVG from '../../components/SVGs/Price';

import { parseSchedule, sortSchedule } from '../../utils/calendar';
import { apiModel } from '../../utils/api';

import styles from './styles.css';
import publishStyles from '../../components/PublishHeader/styles.css';

const { google } = window;

export default class SessionView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: PropTypes.object,
    notifications: PropTypes.array,
    notify: PropTypes.func,
    modal: PropTypes.object,
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
    this.state = { imageExpire: Math.floor(Date.now() / (60 * 1000)) };
  }
  componentDidMount() {
    this.fetchDataClient(this.context.store.dispatch, this.props.params);
  }
  getLowestPrice() {
    const sorted = this.getPrices().sort((p1, p2) => p1.price > p2.price);
    if (sorted.length && sorted[0].price) {
      return sorted.length > 1 ? `from £${sorted[0].price}` : `£${sorted[0].price}`;
    }
    return 'Free';
  }
  getPrices() {
    const { pricing } = this.context.store.getState().get('session');
    return pricing && pricing.prices ? pricing.prices : [];
  }
  getSessionImage() {
    const { user } = this.context;
    const session = this.context.store.getState().get('session');
    if (user && user.user_id === session.owner) return `${session.image}?${this.state.imageExpire}`;
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
    const session = this.context.store.getState().get('session');
    return session && session.actions.indexOf('edit') !== -1;
  }
  dispatchMessageModal = () => {
    const session = this.context.store.getState().get('session');
    this.context.modal.dispatch({ component: <MessageModal to={session.contactEmail} title={<span>Ask <b>{session.contactName}</b> {session.Organizer ? <span>from <b>{session.Organizer.name}</b></span> : ''} a question</span>} url={`/api/session/${session.uuid}/action/message`} /> });
  }
  fetchDataClient = (dispatch, params) => {
    this.setState({ isLoading: true });
    return apiModel.get('session', params.uuid).then(result => {
      const { error, instance } = result;
      if (error) throw error;
      dispatch({ type: 'SESSION_LOADED', payload: instance });
      this.setState({ isLoading: false });
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
      const firstLine = locationPieces.shift();
      locationDetail = (<div className={styles.locationDetail}>
        <img src="/images/map-pin.svg" role="presentation" />
        <span className={styles.detailText}>{firstLine}{locationPieces.length ? <br /> : null}{locationPieces.join(',')}</span>
      </div>);
    }
    return (<div className={styles.detailsSection}>
      <div className={[styles.detailsImg, session.image ? '' : styles.noImg].join(' ')}>
        <img src={session.image ? this.getSessionImage() : '/images/placeholder.png'} role="presentation" />
      </div>
      <div className={styles.detailsText}>
        <h1>
          {this.getTitle()}
          {session.state === 'published' ? null : <span className={styles.state}>(draft)</span>}
        </h1>
        {locationDetail}
        {this.renderDate()}
        <div className={styles.detailPrice}>
          <img src="/images/tag.svg" role="presentation" />
          <b>{this.getLowestPrice()}</b>
        </div>
        {organizerButton}
      </div>
      <Helmet meta={[{ property: 'og:image', content: session.image }, { property: 'og:title', content: session.title }, { property: 'og:description', content: (session.description || '').substr(0, 256) }]} />
    </div>);
  }
  renderLastUpdated(session) {
    const today = new Date();
    const updated = new Date(session.updatedAt);
    let updatedAt = '';
    let freshness = 2;
    const freshStyles = {
      0: '',
      1: styles.recent,
      2: styles.new
    };
    const dayDelta = [today, updated].map(time => Math.floor(time.getTime() / (24 * 60 * 60 * 1000))).reduce((todayDay, updatedDay) => todayDay - updatedDay);
    if (dayDelta === 0) {
      updatedAt = 'today';
    } else if (dayDelta < 7) {
      updatedAt = `${dayDelta} days ago`;
    } else if (dayDelta < 31) {
      updatedAt = `${Math.floor(dayDelta / 7)} week${dayDelta < 14 ? '' : 's'} ago`;
    } else if (dayDelta < 92) {
      updatedAt = 'over a month ago';
      freshness = 1;
    } else {
      updatedAt = 'over three months ago';
      freshness = 0;
    }
    return <span className={[styles.lastUpdated, freshStyles[freshness]].join(' ')} title={dayDelta <= 1 ? '' : `${dayDelta} days ago`}>last updated {updatedAt}</span>;
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
    const prices = this.getPrices();
    return (<div className={styles.descriptionSection}>
      <div className={styles.mainCol}>
        <h2>Description</h2>
        <div className={styles.description}>
          {session.description || <i>This session has no description</i>}
        </div>
        {meetingPoint}
        {preparation}
        {this.renderLastUpdated(session)}
      </div>
      <div className={styles.sideCol}>
        {prices && prices.length ? (<div className={styles.info}>
          <h3>Pricing</h3>
          <div className={`${styles.floatingInfo} ${styles.pricing}`}>
            {prices.map(band => (<div className={styles.price}>
              <span className={styles.label}>{band.type}</span>
              <span className={styles.amount}>
                <img src="/images/tag.svg" role="presentation" /> £{band.price}
              </span>
            </div>))}
          </div>
        </div>) : null}
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
            <p>{session.contactEmail ? (<a className={styles.organizerLink} onClick={this.dispatchMessageModal} onKeyUp={event => event.keyCode === 13 && event.target.click()} tabIndex={0}><img src="/images/email.png" role="presentation" /> Message organiser</a>) : ''}</p>
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
    if (session.pricing) {
      const { firstFree, paymentMethods } = session.pricing;
      const paymentMethodIcons = {
        card: {
          text: 'Card only',
          icon: <PaymentSVG card />
        },
        cash: {
          text: 'Cash only',
          icon: <PaymentSVG cash />
        },
        'cash,card': {
          text: 'Card or cash',
          icon: <PaymentSVG card cash />
        }
      };
      if (firstFree) features = features.concat([{ text: 'First session free', icon: <PriceSVG free /> }]);
      if (paymentMethods in paymentMethodIcons) features = features.concat([paymentMethodIcons[paymentMethods]]);
    }
    return (<div className={styles.aboutSection}>
      <div className={styles.inner}>
        <h2>About this session</h2>
        <ol>
          {features.map(feature => (<li key={feature.text}>
            {feature.iconImg || feature.icon
              ? <span>{feature.icon ? feature.icon : <img className={styles.iconImg} src={feature.iconImg} role="presentation" />}<br /></span>
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
          streetViewControl: false,
          scrollwheel: false,
          zoomControl: true,
          zoomControlOptions: {
            position: google ? google.maps.ControlPosition.TOP_LEFT : 1
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
      address = <div className={styles.address}>{session.location.split(',').map(line => <p key={line}>{line}</p>)}<br /><p><a href={`https://maps.google.com/maps?saddr=My+Location&daddr=${session.location}`} target="blank">Get directions</a></p></div>;
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
    return (<div className={styles.content}>
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
    if (isLoading) return <LoadingMessage message="Loading session" ellipsis />;
    return (<div className={styles.sessionView}>
      {this.canEdit() ? <PublishHeader h2={session && session.state === 'published' ? 'Published session' : 'Preview'} actions={this.getActions()} /> : null}
      <NotificationBar notifications={this.context.notifications} />
      {session ? this.renderSession() : <LoadingMessage message="Session not found" />}
    </div>);
  }
}
