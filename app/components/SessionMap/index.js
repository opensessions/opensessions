import React, { PropTypes } from 'react';

import { withGoogleMap } from 'react-google-maps';
import GoogleMap from 'react-google-maps/lib/GoogleMap';
import MarkerClusterer from 'react-google-maps/lib/addons/MarkerClusterer';
import Marker from 'react-google-maps/lib/Marker';
import InfoWindow from 'react-google-maps/lib/InfoWindow';

import SessionTileView from '../../containers/SessionTileView';

import Checkbox from '../Fields/Checkbox';

import styles from './styles.css';

const GEO_CENTER_UK = { lat: 54.3781, lng: -3.4360 };

const GoogleMapLoader = withGoogleMap(props => (
  <GoogleMap {...props.mapProps}>
    {props.markers}
  </GoogleMap>
));

const GoogleMapLoaderCluster = withGoogleMap(props => (
  <GoogleMap {...props.mapProps}>
    <MarkerClusterer>{props.markers}</MarkerClusterer>
  </GoogleMap>
));

const ACTIVE_ICON = { url: '/images/map-pin-active.svg' };
const INACTIVE_ICON = { url: '/images/map-pin.svg' };

export default class SessionMap extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    notify: PropTypes.func,
    store: PropTypes.object
  };
  static propTypes = {
    location: PropTypes.object,
    sessions: PropTypes.array
  }
  constructor() {
    super();
    this.state = { showInfo: null };
  }
  isActive(session) {
    if (session.schedule) {
      return session.schedule.some(slot => (new Date([slot.startDate, slot.startTime].join('T'))).getTime() > Date.now());
    }
    return false;
  }
  renderMap(sessions, isClustered) {
    const { google } = window;
    const marker = {
      defaultAnimation: 2
    };
    const googleMap = {
      defaultZoom: 6,
      defaultCenter: GEO_CENTER_UK,
      onClick: () => true,
      options: {
        streetViewControl: false,
        scrollwheel: true,
        zoomControl: true,
        zoomControlOptions: {
          position: google ? google.maps.ControlPosition.TOP_LEFT : 1
        },
        mapTypeControl: false
      }
    };
    const { showInfo } = this.state;
    const Loader = isClustered ? GoogleMapLoaderCluster : GoogleMapLoader;
    return (<Loader
      mapElement={<div style={{ height: '100%' }} />}
      containerElement={<div className={styles.mapFrame} style={{ height: '80vh', width: '100%' }} />}
      mapProps={googleMap}
      markers={sessions ? sessions.filter(session => session.locationData && session.locationData.lat).map(session => (<Marker {...marker} icon={this.isActive(session) ? ACTIVE_ICON : INACTIVE_ICON} key={session.uuid} position={session.locationData} onClick={() => this.setState({ showInfo: session.uuid })}>
        {showInfo === session.uuid ? <InfoWindow onCloseClick={() => this.setState({ showInfo: null })}><SessionTileView session={session} style="slim" /></InfoWindow> : null}
      </Marker>)) : null}
    />);
  }
  render() {
    const storeState = this.context.store.getState();
    const sessions = this.props.sessions || storeState.get('sessionList');
    const isClustered = storeState.get('mapClustered');
    return (<div className={styles.frame}>
      <div className={styles.map}>
        {this.renderMap(sessions, isClustered)}
      </div>
      <div className={styles.options}>
        {sessions ? <p>Showing {sessions.length} sessions</p> : null}
        <p><Checkbox checked={isClustered} onChange={val => this.context.store.dispatch({ type: 'MAP_OPTIONS_CLUSTER', payload: val }) && this.forceUpdate()} label="Toggle clustering" /></p>
      </div>
    </div>);
  }
}
