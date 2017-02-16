import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { withGoogleMap } from 'react-google-maps';
import GoogleMap from 'react-google-maps/lib/GoogleMap';
import Marker from 'react-google-maps/lib/Marker';
import Helmet from 'react-helmet';

import MessageModal from '../Modals/Message';
import Tooltip from '../../components/Tooltip';
import NotificationBar from '../../components/NotificationBar';
import SocialShareIcons from '../../components/SocialShareIcons';
import LoadingMessage from '../../components/LoadingMessage';
import PublishHeader from '../../components/PublishHeader';
import PaymentSVG from '../../components/SVGs/PaymentMethod';
import PriceSVG from '../../components/SVGs/Price';
import Button from '../../components/Button';
import SocialMedia from '../../components/SocialMedia';

import { parseSchedule, sortSchedule, weeksAgo } from '../../utils/calendar';
import { apiModel } from '../../utils/api';

import styles from './styles.css';
import publishStyles from '../../components/PublishHeader/styles.css';

const { google, ADMIN_DOMAIN } = window;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const GoogleMapLoader = withGoogleMap(props => (
  <GoogleMap {...props.mapProps}>
    <Marker {...props.marker} />
  </GoogleMap>
));

const actionNext = (result, notify, router, refresh) => {
  const { message, messageType, redirect, instance } = result;
  if (message) notify(message, messageType || 'success');
  if (redirect) {
    if (redirect !== window.location.pathname) router.push(redirect);
    else refresh(instance);
  }
};

export default class SessionView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: PropTypes.object,
    router: PropTypes.object,
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
    this.fetchData();
  }
  getLowestPrice() {
    const prices = this.getPrices().sort((p1, p2) => p1.price > p2.price).map(band => parseFloat(band.price));
    if (prices.length) {
      const price = prices[0];
      return prices.length > 1 ? <span className={styles.from}>{price === 0 ? this.getFree() : `£${price.toFixed(2)}`}</span> : `£${price.toFixed(2)}`;
    }
    return this.getFree();
  }
  getFree() {
    return <span className={styles.freeTag}>FREE</span>;
  }
  getPrices() {
    const { pricing } = this.context.store.getState().get('session');
    return pricing && pricing.prices ? pricing.prices : [];
  }
  getTitle() {
    const session = this.context.store.getState().get('session');
    return session.title || <i>Untitled</i>;
  }
  getActions(session) {
    const { location } = this.props;
    const actions = [];
    const actionProps = {
      touch: { text: 'Touch', onClick: () => apiModel.action('session', session.uuid, 'touch', { method: 'POST' }).then(result => actionNext(result, this.context.notify, this.context.router)) },
      unpublish: { text: 'Unpublish and Edit', onClick: () => apiModel.action('session', session.uuid, 'unpublish').then(result => actionNext(result, this.context.notify, this.context.router)) },
      updateMySchedule: { text: 'Auto-update Schedule', onClick: () => this.context.modal.confirm(`Currently ${session.sortedSchedule.filter(s => s.hasOccurred).length} of your session's dates are in the past by up to ${weeksAgo(new Date(session.sortedSchedule[0].start)) * -1} weeks. This will shift your schedule ahead by that many weeks so all dates are in the future. Are you sure you want to continue?`, () => apiModel.action('session', session.uuid, 'updateMySchedule').then(result => actionNext(result, this.context.notify, this.context.router, () => this.fetchData()))) }
    };
    if (this.canAct('edit')) {
      let tab = false;
      if (location && location.query && location.query.tab) tab = location.query.tab;
      if (session.actions.some(action => action === 'edit')) actions.push(<Link key="edit" to={[session.href, 'edit', tab].filter(v => v).join('/')} className={publishStyles.previewButton}>Continue editing</Link>);
    }
    Object.keys(actionProps).filter(key => this.canAct(key)).map(key => [key, actionProps[key]]).forEach(([key, props]) => {
      actions.push(<Button key={key} onClick={props.onClick} className={publishStyles.previewButton}>{props.text}</Button>);
    });
    if (!actions.length) return null;
    return actions;
  }
  fetchData() {
    return this.fetchDataClient(this.context.store.dispatch, this.props.params);
  }
  canAct(type) {
    const session = this.context.store.getState().get('session');
    return session && session.actions.some(action => action === type);
  }
  isAdmin() {
    const { user } = this.context;
    return user && user.email && user.email.indexOf(`@${ADMIN_DOMAIN}`) !== -1;
  }
  dispatchMessageModal = () => {
    const session = this.context.store.getState().get('session');
    this.context.modal.dispatch({ component: <MessageModal title={<span>Ask <b>{session.info.contact.name}</b> {session.Organizer ? <span>from <b>{session.Organizer.name}</b></span> : ''} a question</span>} url={`/api/session/${session.uuid}/action/message`} /> });
  }
  fetchDataClient = (dispatch, params) => {
    this.setState({ isLoading: true });
    return apiModel.get('session', params.uuid).then(result => {
      const { error, instance } = result;
      if (error) throw error;
      dispatch({ type: 'SESSION_LOADED', payload: instance });
      this.setState({ isLoading: false });
      if (instance.actions.some(action => action === 'trackView')) apiModel.action('session', params.uuid, 'trackView');
    }).catch(() => {
      this.context.notify('Failed to load session', 'error');
      this.setState({ isLoading: false });
    });
  }
  formatPrice(priceText) {
    const price = parseFloat(priceText) || 0;
    return price ? `£${price.toFixed(2)}` : 'FREE';
  }
  renderDate() {
    const session = this.context.store.getState().get('session');
    const { sortedSchedule } = session;
    const sorted = sortedSchedule.filter(slot => !slot.hasOccurred);
    const LIMIT = 2;
    const scheduleItems = this.state.scheduleItems || LIMIT;
    return (<div className={styles.dateDetail}>
      <img src="/images/calendar.svg" role="presentation" />
      {sorted.length ? (<ol className={styles.dateList}>
        {sorted.slice(0, scheduleItems).map((slot, index) => <li className={[styles.detailText, index === 0 ? styles.nextOccurring : ''].join(' ')}>
          {slot.date} {slot.time ? <span className={styles.timespan}>at {slot.time}</span> : null}
          {index === 0 || slot.duration !== sorted[index - 1].duration ? <span className={styles.duration}><img src="/images/clock.svg" role="presentation" />{slot.duration}</span> : null}
        </li>)}
        {sorted.length > LIMIT ? <li onClick={() => this.setState({ scheduleItems: scheduleItems >= sorted.length ? LIMIT : Math.min(scheduleItems + 3, sorted.length) })} className={styles.expandSchedule}>{scheduleItems >= sorted.length ? 'Show fewer dates ▴' : 'Show more dates ▾'}</li> : null}
      </ol>) : <span className={styles.noSchedule}>No upcoming sessions</span>}
    </div>);
  }
  renderDetails(session) {
    let locationDetail = null;
    if (session.location) {
      const locationPieces = session.locationData && session.locationData.manual ? session.locationData.manual : session.location.split(', ');
      locationDetail = (<div className={styles.locationDetail}>
        <img src="/images/map-pin.svg" role="presentation" />
        <span className={styles.detailText}>{locationPieces.map(line => <span className={styles.addrLine}>{line}</span>)}</span>
      </div>);
    }
    return (<div className={styles.detailsSection}>
      <div className={[styles.detailsImg, session.image ? '' : styles.noImg].join(' ')}>
        <img src={session.image ? `${session.image}${this.canAct('edit') ? `?${this.state.imageExpire}` : ''}` : '/images/placeholder.png'} role="presentation" />
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
          {session.pricing && session.pricing.firstFree ? <span>First session {this.getFree()}</span> : this.getLowestPrice()}
        </div>
        <div className={styles.contactButton}>
          {session.Organizer ? <Button to={session.Organizer.href} style="slim">View organiser</Button> : null}
        </div>
      </div>
      <Helmet title={session.title} titleTemplate="%s - Open Sessions" meta={[['og:image', session.image], ['og:title', session.title], ['og:description', (session.description || '').substr(0, 256)], ['og:url', session.absoluteURL]].map(([property, content]) => ({ property, content })).concat([['twitter:card', 'summary'], ['twitter:site', '@open_sessions'], ['twitter:creator', session.info.social.twitter]].map(([name, content]) => ({ name, content })))} />
    </div>);
  }
  renderLastUpdated(session) {
    const today = new Date();
    const updated = new Date(session.updatedAt);
    let updatedAt = '';
    let freshness = 2;
    const freshStyles = ['', styles.recent, styles.new];
    const dayDelta = [today, updated].map(time => Math.floor(time.getTime() / MS_PER_DAY)).reduce((todayDay, updatedDay) => todayDay - updatedDay);
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
  renderPriceList(prices) {
    return (<ol className={styles.prices}>
      {(prices && prices.length ? prices : [{ type: '', price: 0 }]).map(band => (<li>
        <span className={styles.label}>{band.type}</span>
        <span className={styles.amount}>
          <img src="/images/tag.svg" role="presentation" />
          {this.formatPrice(band.price)}
        </span>
      </li>))}
    </ol>);
  }
  renderDescription(session) {
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
    const activitiesList = session.Activities ? <ol className={styles.activitiesList}>{session.Activities.map(activity => <li key={activity.name}><Link to={`/sessions?activity=${activity.name}`}>{activity.name}</Link></li>)}</ol> : null;
    const prices = this.getPrices();
    const { pricing, info } = session;
    return (<div className={styles.descriptionSection}>
      <div className={styles.mainCol}>
        <h2>Description</h2>
        <div className={styles.description}>
          {session.description || <i>This session has no description</i>}
        </div>
        {meetingPoint}
        {preparation}
        {this.isAdmin() ? activitiesList : null}
        {this.isAdmin() ? this.renderLastUpdated(session) : null}
      </div>
      <div className={styles.sideCol}>
        <div className={styles.info}>
          <h3>Pricing</h3>
          <div className={`${styles.floatingInfo} ${styles.pricing}`}>
            {pricing && pricing.firstFree ? (<div>
              <strong>First Session</strong>
              <div>
                <span className={styles.amount}><img src="/images/tag.svg" role="presentation" /> FREE</span>
              </div>
              <strong>and then</strong>
              {this.renderPriceList(prices)}
            </div>) : (<div>{this.renderPriceList(prices)}</div>)}
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
            <p>{this.canAct('message') ? <Button style="slim" onClick={this.dispatchMessageModal} icon="/images/email.png" tip="Got a question about this session?">Message</Button> : null}</p>
            <p>{info.contact.phone ? (<a className={styles.organizerLink} href={`tel:${info.contact.phone}`}><img src="/images/phone.svg" role="presentation" /> {info.contact.phone}</a>) : ''}</p>
            <SocialMedia item={info.social} />
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
  renderAbout(session) {
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
  renderMap(session) {
    const data = session.locationData;
    let map = null;
    let address = null;
    if (data && data.lat && data.lng) {
      const defaultCenter = data;
      const marker = {
        position: defaultCenter,
        icon: { url: '/images/map-pin-active.svg' },
        defaultAnimation: 2
      };
      const mapProps = {
        defaultZoom: 16,
        defaultCenter,
        onClick: () => true,
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
      map = (<GoogleMapLoader
        containerElement={<div className={styles.mapFrame} />}
        mapElement={<div style={{ height: '100%' }} />}
        marker={marker}
        mapProps={mapProps}
      />);
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
  renderShare(session) {
    const { title, href } = session;
    const link = `${process.env.SERVICE_LOCATION}${href}`;
    const disabled = session.state !== 'published';
    const { isOpened } = this.state;
    return (<div className={[styles.shareSection, disabled ? styles.disabled : null].join(' ')} onMouseOver={() => this.setState({ isOpened: true })} onMouseOut={() => this.setState({ isOpened: false })}>
      <div className={styles.inner}>
        <span style={{ position: 'relative' }}>
          Share this session
          {disabled ? <Tooltip tip="Enabled when published" isOpened={isOpened} style="dark" /> : null}
        </span>
        <SocialShareIcons link={link} title={title} message="I found this cool session on Open Sessions! Wanna go?" />
      </div>
    </div>);
  }
  renderSession(session) {
    return (<div className={styles.content}>
      {this.renderDetails(session)}
      {this.renderShare(session)}
      {this.renderDescription(session)}
      {this.renderAbout(session)}
      {this.renderMap(session)}
    </div>);
  }
  render() {
    const { isLoading } = this.state;
    const session = this.context.store.getState().get('session');
    if (isLoading) return <LoadingMessage message="Loading session" ellipsis />;
    const actions = this.getActions(session);
    return (<div className={styles.sessionView}>
      {actions ? <PublishHeader h2={session && session.state === 'published' ? 'Published session' : 'Preview'} actions={actions} /> : null}
      <NotificationBar />
      {session ? this.renderSession(session) : <LoadingMessage message="Session not found" />}
    </div>);
  }
}
