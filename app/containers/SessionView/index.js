import React from 'react';
import { parseSchedule } from 'utils/postgres';

import GoogleMapLoader from 'react-google-maps/lib/GoogleMapLoader';
import GoogleMap from 'react-google-maps/lib/GoogleMap';
import Marker from 'react-google-maps/lib/Marker';

import SocialShareIcons from 'components/SocialShareIcons';

import { Link } from 'react-router';

import { apiFetch } from '../../utils/api';

import styles from './styles.css';

export default class SessionView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: React.PropTypes.object,
  }
  static propTypes = {
    params: React.PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.state = {
      session: null,
    };
  }
  componentDidMount() {
    const self = this;
    apiFetch(`/api/session/${this.props.params.uuid}`).then((result) => {
      if (!result.error) {
        self.setState({ session: result.instance });
      } else {
        self.setState({ error: result.error });
      }
    });
  }
  getPrice() {
    let price = this.state.session.price;
    if (price !== Math.floor(price)) {
      const minor = Math.ceil((price % 1) * 100);
      const major = Math.floor(price);
      price = `${major}.${minor}`;
    }
    return `£${price}`;
  }
  getState() {
    let { state } = this.state.session;
    if (state !== 'published') return <span className={styles.state}>({state})</span>;
    return null;
  }
  renderDate() {
    const { session } = this.state;
    const data = parseSchedule(session);
    if (!(data.date || data.time)) {
      return null;
    }
    let duration = null;
    if (data.duration) {
      duration = <span className={styles.duration}><img src="/images/clock.svg" role="presentation" />{data.duration}</span>;
    }
    return (<div className={styles.dateDetail}>
      <img src="/images/calendar.svg" role="presentation" />
      <span className={styles.detailText}>
        {data.date}
        <span className={styles.timespan}>at {data.time}</span>
        {duration}
      </span>
    </div>);
  }
  renderActions() {
    const user = this.context ? this.context.user : false;
    const session = this.state.session || {};
    const actions = [];
    if (user && user.user_id === session.owner) {
      actions.push(<Link to={`/session/${session.uuid}/edit`} key="edit">Edit</Link>);
    }
    if (!actions.length) return null;
    return (<div className={styles.actions}>
      {actions}
    </div>);
  }
  renderDetails() {
    const session = this.state.session;
    let organizerButton = null;
    if (session.Organizer) {
      organizerButton = <div className={styles.contactButton}><Link to={session.Organizer.href}>Contact organizer</Link></div>;
    }
    let locationDetail = null;
    if (session.location) {
      const locationPieces = session.location.split(',');
      let location = session.location;
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
        <img src="/images/placeholder.png" role="presentation" />
      </div>
      <div className={styles.detailsText}>
        <h1>{session.title}{this.getState()}</h1>
        {locationDetail}
        {this.renderDate()}
        <div className={styles.detailPrice}>
          <img src="/images/tag.svg" role="presentation" />
          from <b>{this.getPrice()}</b>
        </div>
        {organizerButton}
      </div>
    </div>);
  }
  renderDescription() {
    const session = this.state.session;
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
          {session.description}
        </div>
        {meetingPoint}
        {preparation}
      </div>
      <div className={styles.sideCol}>
        <div className={styles.info}>
          <h3>Pricing</h3>
          <div className={`${styles.floatingInfo} ${styles.pricing}`}>
            <span className={styles.label}>{session.attendanceType}</span>
            <span className={styles.price}>
              <img src="/images/tag.svg" role="presentation" />
              {this.getPrice()}
            </span>
          </div>
        </div>
        <div className={styles.info}>
          <h3>Session Leader</h3>
          <div className={styles.floatingInfo}>
            {session.leader ? session.leader : 'No leader'}
          </div>
        </div>
        <div className={styles.info}>
          <h3>Organiser</h3>
          <div className={`${styles.floatingInfo} ${styles.organizerInfo}`}>
            <p>{session.Organizer ? (<Link to={session.Organizer.href}>{session.Organizer.name}</Link>) : 'No organizer'}</p>
            <p>{session.contactPhone ? (<a className={styles.organizerLink} href={`tel:${session.contactPhone}`}><img src="/images/phone.svg" role="presentation" /> {session.contactPhone}</a>) : ''}</p>
            <p>{session.contactEmail ? (<a className={styles.organizerLink} href={`mailto:${session.contactEmail}`}><img src="/images/email.png" role="presentation" /> {session.contactEmail}</a>) : ''}</p>
          </div>
        </div>
      </div>
    </div>);
  }
  renderAbout() {
    const session = this.state.session;
    const features = [];
    const maps = {
      gender: {
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
      }
    };
    if (session.genderRestriction) {
      features.push(maps.gender[session.genderRestriction]);
    }
    if (session.minAgeRestriction) {
      features.push({
        iconText: session.minAgeRestriction,
        text: 'Minimum Age'
      });
    }
    if (session.maxAgeRestriction) {
      features.push({
        iconText: session.maxAgeRestriction,
        text: 'Maximum Age'
      });
    }
    if (session.hasCoaching) {
      features.push({
        iconImg: '/images/coached.png',
        text: 'Coached'
      });
    }
    return (<div className={styles.aboutSection}>
      <div className={styles.inner}>
        <h2>About this session</h2>
        <ol>
          {features.map((feature) => {
            let icon = <span className={styles.iconText}>{feature.iconText}</span>;
            if (feature.iconImg) {
              icon = <span><img className={styles.iconImg} src={feature.iconImg} role="presentation" /><br /></span>;
            }
            return (<li key={feature.text}>
              {icon}
              {feature.text}
            </li>);
          })}
        </ol>
      </div>
    </div>);
  }
  renderMap() {
    const session = this.state.session;
    let map = null;
    if (!session.locationData) {
      map = (<div className={styles.noLocation}>
        <img src="/images/map-pin.svg" role="presentation" />
        No location data
      </div>);
    } else {
      const locData = JSON.parse(session.locationData);
      const defaultCenter = { lat: locData.lat, lng: locData.lng };
      const onMapClick = () => true;
      const marker = {
        position: defaultCenter,
        icon: { url: '/images/map-pin-active.svg' },
        defaultAnimation: 2
      };
      map = (<GoogleMapLoader
        containerElement={<div style={{ height: '100%' }} />}
        googleMapElement={
          <GoogleMap
            ref="map"
            defaultZoom={16}
            defaultCenter={defaultCenter}
            onClick={onMapClick}
            options={{ streetViewControl: false }}
          >
            <Marker {...marker} />
          </GoogleMap>
        }
      />);
    }
    return (<section className={styles.mapSection}>
      {map}
    </section>);
  }
  renderShare() {
    const { title, href } = this.state.session;
    const link = `${window.location.origin}${href}`;
    return (<div className={styles.shareSection}>
      <div className={styles.inner}>
        Share this session
        <SocialShareIcons link={link} title={title} />
      </div>
    </div>);
  }
  render() {
    const topAttrs = { className: styles.sessionView };
    if (this.state.error) return (<div {...topAttrs}>{this.state.error}</div>);
    if (this.state.session === null) return (<div {...topAttrs}>Loading...</div>);
    return (<div {...topAttrs}>
      {this.renderActions()}
      {this.renderDetails()}
      {this.renderShare()}
      {this.renderDescription()}
      {this.renderAbout()}
      {this.renderMap()}
    </div>);
  }
}
