import React, { PropTypes } from 'react';

import SessionTileView from '../SessionTileView';
import LoadingMessage from '../../components/LoadingMessage';

import { withGoogleMap } from 'react-google-maps';
import GoogleMap from 'react-google-maps/lib/GoogleMap';
import Marker from 'react-google-maps/lib/Marker';
import InfoWindow from 'react-google-maps/lib/InfoWindow';

import { apiModel } from '../../utils/api';

import styles from './styles.css';

const GEO_CENTER_UK = { lat: 54.3781, lng: -3.4360 };

const GoogleMapLoader = withGoogleMap(props => (
  <GoogleMap {...props.mapProps}>
    {props.markers}
  </GoogleMap>
));

export default class SessionMap extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    notify: PropTypes.func,
    store: PropTypes.object
  };
  static propTypes = {
    location: PropTypes.object
  };
  static fetchData(dispatch, query) {
    return apiModel.search('session', { ...query, state: 'published' }).then(result => {
      const { instances, error } = result;
      if (error) throw error;
      dispatch({ type: 'SESSION_LIST_LOADED', payload: instances });
    });
  }
  constructor() {
    super();
    this.state = { isLoading: false, showInfo: null };
  }
  componentDidMount() {
    this.setState({ isLoading: true }); // eslint-disable-line react/no-did-mount-set-state
    this.constructor.fetchData(this.context.store.dispatch, this.props.location.query).then(() => {
      this.setState({ isLoading: false });
    }).catch(error => {
      this.context.notify(error, 'error');
    });
  }
  renderMap(sessions) {
    const { google } = window;
    const marker = {
      icon: { url: '/images/map-pin-active.svg' },
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
    return (<GoogleMapLoader
      mapElement={<div style={{ height: '100%' }} />}
      containerElement={<div className={styles.mapFrame} style={{ height: '80rem', width: '100%' }} />}
      mapProps={googleMap}
      markers={sessions ? sessions.filter(session => session.locationData && session.locationData.lat).map(session => <Marker key={session.uuid} position={session.locationData} onClick={() => this.setState({ showInfo: session.uuid })} {...marker}>{showInfo === session.uuid ? <InfoWindow onCloseClick={() => this.setState({ showInfo: null })}><SessionTileView session={session} /></InfoWindow> : null}</Marker>) : null}
    />);
  }
  render() {
    const isLoading = this.state ? this.state.isLoading : false;
    const sessions = this.context.store.getState().get('sessionList');
    return (<div>
      {isLoading ? <LoadingMessage message="Loading sessions" ellipsis /> : this.renderMap(sessions)}
    </div>);
  }
}
