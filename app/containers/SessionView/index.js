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
    apiFetch(`/api/session/${this.props.params.uuid}`)
      .then((session) => self.setState({ session }));
  }
  date() {
    const date = new Date(this.state.session.startDate);
    const time = this.state.session.startTime ? this.state.session.startTime.split(':') : ['00', '00', '00'];
    time.pop();
    return `${moment(date).format('dddd D MMM')} at ${time.join(':')}`;
  }
  renderActions() {
    const user = this.context ? this.context.user : false;
    const session = this.state.session || {};
    const actions = [];
    if (user && user.user_id === session.owner) {
      actions.push(<Link to={`/session/${session.uuid}/edit`}>Edit</Link>);
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
          from £{session.price}
        </div>
        {organizerButton}
      </div>
    </div>);
  }
  renderDescription() {
    const session = this.state.session;
    let meetingPoint = null;
    if (session.meetingPoint) {
      meetingPoint = (<div>
        <h3>Session meeting point</h3>
        <div className={styles.description}>
          {session.meetingPoint}
        </div>
      </div>);
    }
    let preparation = null;
    if (session.preparation) {
      preparation = (<div>
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
        <h3>Pricing</h3>
        <div className={styles.floatingInfo}>
          <span className={styles.label}>General</span>
          <span className={styles.price}>
            <img src="/images/tag.svg" role="presentation" />
            £{session.price}
          </span>
        </div>
        <h3>Session Leader</h3>
        <div className={styles.floatingInfo}>
          {session.leader}
        </div>
        <h3>Organiser</h3>
        <div className={styles.floatingInfo}>
          <p>{session.Organizer ? (<Link to={session.Organizer.href}>{session.Organizer.name}</Link>) : 'No organizer'}</p>
          <p>{session.contactPhone ? (<a href={`tel:${session.contactPhone}`}>{session.contactPhone}</a>) : ''}</p>
          <p>{session.contactEmail ? (<a href={`mailto:${session.contactEmail}`}>{session.contactEmail}</a>) : ''}</p>
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
      features.push(<span><img className={styles.iconImg} src="/images/coached.png" role="presentation" /><br />Coached</span>);
    }
    if (session.genderRestriction) {
      const genderData = maps.gender[session.genderRestriction];
      features.push(<span><img className={styles.iconImg} src={genderData.img} role="presentation" /><br />{genderData.text}</span>);
    }
    if (session.minAgeRestriction) {
      features.push(<span><span className={styles.iconText}>{session.minAgeRestriction}</span> Minimum Age</span>);
    }
    if (session.maxAgeRestriction) {
      features.push(<span><span className={styles.iconText}>{session.maxAgeRestriction}</span> Maximum Age</span>);
    }
    return (<div className={styles.aboutSection}>
      <div className={styles.inner}>
        <h2>About this session</h2>
        <ol>
          {features.map((feature) => <li>{feature}</li>)}
        </ol>
      </div>
    </div>);
  }
  renderMap() {
    const session = this.state.session;
    const locData = JSON.parse(session.locationData);
    let map = null;
    if (!locData) {
      map = (<div className={styles.noLocation}>
        <img src="/images/map-pin.svg" role="presentation" />
        No location data
      </div>);
    } else {
      const defaultCenter = { lat: locData.lat, lng: locData.lng };
      const onMapClick = () => true;
      const marker = {
        position: defaultCenter,
        defaultAnimation: 2
      };
      map = (<GoogleMapLoader
        containerElement={<div style={{ height: '100%' }} />}
        googleMapElement={
          <GoogleMap
            ref={(mapRef) => console.log(mapRef)}
            defaultZoom={16}
            defaultCenter={defaultCenter}
            onClick={onMapClick}
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
  render() {
    if (this.state.session === null) return (<div>Loading</div>);
    return (
      <div className={styles.sessionView}>
        {this.renderDetails()}
        <div className={styles.shareSection}>
          <div className={styles.inner}>Share this session</div>
        </div>
        {this.renderDescription()}
        {this.renderAbout()}
        {this.renderMap()}
      </div>
    );
  }
}
