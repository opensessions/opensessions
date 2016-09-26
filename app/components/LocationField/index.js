import React, { PropTypes } from 'react';

import GoogleMapLoader from 'react-google-maps/lib/GoogleMapLoader';
import GoogleMap from 'react-google-maps/lib/GoogleMap';
import Marker from 'react-google-maps/lib/Marker';

import styles from './styles.css';

export default class LocationField extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    dataValue: PropTypes.object,
    onChange: PropTypes.func,
    onDataChange: PropTypes.func,
    defaultLocation: PropTypes.object,
    className: PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = { clean: true };
  }
  componentDidMount() {
    const options = { types: [], componentRestrictions: { country: 'gb' } };
    const { input } = this.refs;
    const { maps } = window.google;
    const autocomplete = new maps.places.Autocomplete(input, options);
    maps.event.addListener(autocomplete, 'place_changed', () => {
      const place = autocomplete.getPlace();
      this.onPlaceChange(place);
      return place;
    });
  }
  onBlur = event => {
    if (!this.state.clean) {
      event.target.value = '';
    }
  }
  onFocus = event => {
    event.target.select();
  }
  onChange = event => {
    if (!(event.nativeEvent.detail && event.nativeEvent.detail === 'generated')) {
      this.setState({ clean: false });
      event.stopPropagation();
      event.preventDefault();
    }
  }
  onPlaceChange = place => {
    if (!place.geometry) throw alert('No map data for this location; please try a different address');
    this.latLngChange(place.geometry.location, { placeID: place.place_id });
    this.props.onChange(place.formatted_address);
    this.setState({ clean: true });
  }
  latLngChange = (latLng, extraData) => {
    const locationData = {
      lat: latLng.lat(),
      lng: latLng.lng(),
      ...extraData
    };
    this.changeCenter(locationData);
    this.props.onDataChange(locationData);
  }
  changeCenter = locationData => {
    if (this.refs.component) {
      this.refs.component.panTo(locationData);
    }
  }
  render() {
    const { value, dataValue, className } = this.props;
    const attrs = {
      type: 'text',
      name,
      className,
      ref: 'input',
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      onChange: this.onChange,
      placeholder: value,
      defaultValue: value
    };
    let map = null;
    let mapHelp = null;
    let locationData = dataValue;
    if (locationData) {
      if (typeof locationData === 'string') locationData = JSON.parse(locationData);
      const marker = {
        position: locationData,
        icon: { url: '/images/map-pin-active.svg' },
        defaultAnimation: 2,
        draggable: true,
        cursor: '-webkit-grab, move',
        onDragend: drag => {
          this.latLngChange(drag.latLng);
        }
      };
      const mapProps = {
        defaultZoom: 15,
        defaultCenter: locationData,
        center: locationData,
        ref: 'component',
        draggableCursor: '-webkit-grab, move',
        options: { streetViewControl: false, scrollwheel: false, mapTypeControl: false }
      };
      map = (<GoogleMapLoader
        containerElement={<div className={styles.mapView} />}
        googleMapElement={<GoogleMap {...mapProps} draggableCursor={mapProps.draggableCursor}>
          <Marker {...marker} />
        </GoogleMap>}
      />);
      mapHelp = <p className={styles.dragHelp}>Drag map pin to refine location</p>;
    }
    return (<div>
      <input {...attrs} />
      {map}
      {mapHelp}
    </div>);
  }
}
