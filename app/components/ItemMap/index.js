import React, { PropTypes } from 'react';

import { withGoogleMap } from 'react-google-maps';
import GoogleMap from 'react-google-maps/lib/GoogleMap';
import MarkerClusterer from 'react-google-maps/lib/addons/MarkerClusterer';
import Marker from 'react-google-maps/lib/Marker';
import InfoWindow from 'react-google-maps/lib/InfoWindow';

import Checkbox from '../Fields/Checkbox';

import styles from './styles.css';

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

const getZoom = (bounds, mapDim) => {
  const WORLD_DIM = { height: 256, width: 256 };
  const ZOOM_MAX = 16;

  const latRad = lat => {
    const sin = Math.sin((lat * Math.PI) / 180);
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  };

  const zoom = (mapPx, worldPx, fraction) => Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);

  const [ne, sw] = [bounds.getNorthEast(), bounds.getSouthWest()];

  const latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

  const lngDiff = ne.lng() - sw.lng();
  const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

  const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
  const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

  return Math.min(latZoom, lngZoom, ZOOM_MAX);
};

export default class ItemMap extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    store: PropTypes.object
  };
  static propTypes = {
    location: PropTypes.object,
    markers: PropTypes.array,
    size: PropTypes.number,
    hasSidebar: PropTypes.bool
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
  renderMap(markers, isClustered) {
    const { google } = window;
    const latlngbounds = new google.maps.LatLngBounds();
    markers.forEach(marker => {
      const { lat, lng } = marker;
      latlngbounds.extend(new google.maps.LatLng(lat, lng));
    });
    console.log('latlngbounds', latlngbounds);
    const googleMap = {
      defaultZoom: getZoom(latlngbounds, { height: 500, width: 500 }) || 15,
      defaultCenter: latlngbounds.getCenter(),
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
    const sizes = ['24vh', '48vh', '80vh'];
    const size = 'size' in this.props ? this.props.size : 2;
    if (!markers.length) return <div className={styles.noItems}>No items to show</div>;
    return (<Loader
      mapElement={<div style={{ height: '100%' }} />}
      containerElement={<div className={styles.mapFrame} style={{ height: sizes[size], width: '100%' }} />}
      mapProps={googleMap}
      markers={markers ? markers.map((marker, key) => (<Marker defaultAnimation={2} icon={marker.isActive ? ACTIVE_ICON : INACTIVE_ICON} key={key} position={marker} onClick={() => this.setState({ showInfo: showInfo !== key ? key : null })}>
        {marker.box && showInfo === key ? <InfoWindow onCloseClick={() => this.setState({ showInfo: null })}>{marker.box()}</InfoWindow> : null}
      </Marker>)) : null}
    />);
  }
  render() {
    const { hasSidebar, markers } = this.props;
    const storeState = this.context.store.getState();
    const isClustered = storeState.get('mapClustered');
    return (<div className={styles.frame}>
      <div className={styles.map}>
        {this.renderMap(markers, isClustered)}
      </div>
      {hasSidebar ? <div className={styles.options}>
        {markers ? <p>Showing {markers.length} items</p> : null}
        <p><Checkbox checked={isClustered} onChange={val => this.context.store.dispatch({ type: 'MAP_OPTIONS_CLUSTER', payload: val }) && this.forceUpdate()} label="Toggle clustering" /></p>
      </div> : null}
    </div>);
  }
}
