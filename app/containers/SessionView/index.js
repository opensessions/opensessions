import React from 'react';
import moment from 'moment';

import { GoogleMapLoader, GoogleMap, Marker } from 'react-google-maps';

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
        self.setState({ session: result });
      } else {
        self.setState({ error: result.error });
      }
    });
  }
  getStartTime() {
    return this.postgresTimeToDate(this.state.session.startTime);
  }
  getEndTime() {
    return this.postgresTimeToDate(this.state.session.endTime);
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
  postgresTimeToDate(time) {
    return new Date(`2000-01-01 ${time}`);
  }
  date() {
    const { session } = this.state;
    const date = new Date(session.startDate);
    const time = session.startTime ? session.startTime.split(':') : ['00', '00', '00'];
    time.pop();
    let duration = null;
    if (session.endTime) {
      const dur = moment.duration(moment(this.getEndTime()).diff(moment(this.getStartTime())));
      const hours = (dur.asHours() + 24) % 24;
      duration = <span className={styles.duration}><img src="/images/clock.svg" role="presentation" />{hours}h</span>;
    }
    return (<span>
      {moment(date).format('dddd D MMM')}
      <span className={styles.timespan}>at {time.join(':')}</span>
      {duration}
    </span>);
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
        location = <span className={styles.locationText}>{firstLine}<br />{locationPieces.join(',')}</span>;
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
        {this.renderActions()}
        <h1>{session.displayName}</h1>
        {locationDetail}
        <div className={styles.dateDetail}>
          <img src="/images/calendar.svg" role="presentation" />
          {this.date()}
        </div>
        <div className={styles.detailPrice}>
          <img src="/images/tag.svg" role="presentation" />
          from {this.getPrice()}
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
          <div className={styles.floatingInfo}>
            <span className={styles.label}>General</span>
            <span className={styles.price}>
              <img src="/images/tag.svg" role="presentation" />
              {this.getPrice()}
            </span>
          </div>
        </div>
        <div className={styles.info}>
          <h3>Session Leader</h3>
          <div className={styles.floatingInfo}>
            {session.leader}
          </div>
        </div>
        <div className={styles.info}>
          <h3>Organiser</h3>
          <div className={styles.floatingInfo}>
            <p>{session.Organizer ? (<Link to={session.Organizer.href}>{session.Organizer.name}</Link>) : 'No organizer'}</p>
            <p>{session.contactPhone ? (<a href={`tel:${session.contactPhone}`}>{session.contactPhone}</a>) : ''}</p>
            <p>{session.contactEmail ? (<a href={`mailto:${session.contactEmail}`}>{session.contactEmail}</a>) : ''}</p>
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
          img: '/images/male-selected.svg'
        },
        female: {
          text: 'Female Only',
          img: '/images/female-selected.svg'
        },
        mixed: {
          text: 'Mixed Gender',
          img: '/images/mixed-selected.svg'
        }
      }
    };
    if (session.hasCoaching) {
      features.push({
        iconImg: '/images/coached.png',
        text: 'Coached'
      });
    }
    if (session.genderRestriction) {
      const genderData = maps.gender[session.genderRestriction];
      features.push({
        iconImg: genderData.img,
        text: genderData.text
      });
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
    return (<div className={styles.aboutSection}>
      <div className={styles.inner}>
        <h2>About this session</h2>
        <ol>
          {features.map((feature) => {
            let icon = null;
            if (feature.iconImg) {
              icon = <span><img className={styles.iconImg} src={feature.iconImg} role="presentation" /><br /></span>;
            } else {
              icon = <span className={styles.iconText}>{feature.iconText}</span>;
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
        icon: { url: '/images/map-pin.svg' },
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
    return (<div className={styles.shareSection}>
      <div className={styles.inner}>Share this session</div>
    </div>);
  }
  render() {
    const topAttrs = { className: styles.sessionView };
    if (this.state.error) return (<div {...topAttrs}>{this.state.error}</div>);
    if (this.state.session === null) return (<div {...topAttrs}>Loading</div>);
    return (<div {...topAttrs}>
      {this.renderDetails()}
      {this.renderShare()}
      {this.renderDescription()}
      {this.renderAbout()}
      {this.renderMap()}
    </div>);
  }
}
