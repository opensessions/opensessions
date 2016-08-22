import React from 'react';

import GoogleMapLoader from 'react-google-maps/lib/GoogleMapLoader';
import GoogleMap from 'react-google-maps/lib/GoogleMap';
import Marker from 'react-google-maps/lib/Marker';

import styles from './styles.css';

export default class LocationField extends React.Component {
  static propTypes = {
    onFocus: React.PropTypes.func,
    onBlur: React.PropTypes.func,
    onChange: React.PropTypes.func,
    onValueChangeByName: React.PropTypes.func,
    defaultLocation: React.PropTypes.object,
    className: React.PropTypes.string,
    model: React.PropTypes.object,
    name: React.PropTypes.string.isRequired,
    dataName: React.PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = { clean: true };
  }
  componentDidMount() {
    const options = { types: [] };
    const { input } = this.refs;
    const { maps } = window.google;
    const autocomplete = new maps.places.Autocomplete(input, options);
    maps.event.addListener(autocomplete, 'place_changed', () => {
      const place = autocomplete.getPlace();
      this.onPlaceChange(place);
      return place;
    });
  }
  onBlur = (event) => {
    if (!this.state.clean) {
      event.target.value = '';
    }
    if (this.props.onBlur) this.props.onBlur(event);
  }
  onFocus = (event) => {
    event.target.select();
    if (this.props.onFocus) this.props.onFocus(event);
  }
  onChange = (event) => {
    if (!(event.nativeEvent.detail && event.nativeEvent.detail === 'generated')) {
      this.setState({ clean: false });
      event.stopPropagation();
      event.preventDefault();
    }
  }
  onPlaceChange = (place) => {
    if (!place.geometry) throw alert('No map data for this location; please try a different address');
    this.latLngChange(place.geometry.location, { placeID: place.place_id });
    this.props.onValueChangeByName(this.props.name, place.formatted_address);
    this.setState({ clean: true });
    this.dispatchChange();
  }
  onMapClick = (event) => {
    this.onPlaceChange({ formatted_address: this.props.model[this.props.name], geometry: { location: event.latLng } });
  }
  dispatchChange = () => {
    const changeEvent = new CustomEvent('input', { bubbles: true, detail: 'generated' });
    this.refs.input.dispatchEvent(changeEvent);
  }
  latLngChange = (latLng, extraData) => {
    const locationData = {
      lat: latLng.lat(),
      lng: latLng.lng(),
      ...extraData
    };
    this.changeCenter(locationData);
    this.props.onValueChangeByName(this.props.dataName, locationData);
  }
  changeCenter = (locationData) => {
    if (this.refs.component) {
      this.refs.component.panTo(locationData);
    }
  }
  render() {
    const { model, name, dataName, className } = this.props;
    const attrs = {
      type: 'text',
      name,
      className,
      ref: 'input',
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      onChange: this.onChange,
      placeholder: model[name],
      defaultValue: model[name]
    };
    let map = null;
    let mapHelp = null;
    let locationData = model[dataName];
    if (locationData) {
      if (typeof locationData === 'string') {
        locationData = JSON.parse(locationData);
      }
      const marker = {
        position: locationData,
        icon: { url: '/images/map-pin-active.svg' },
        defaultAnimation: 2,
        draggable: true,
        onDragend: (drag) => {
          this.latLngChange(drag.latLng);
          this.dispatchChange();
        }
      };
      const mapProps = {
        defaultZoom: 15,
        defaultCenter: locationData,
        center: locationData,
        ref: 'component',
        onClick: this.onMapClick,
        options: { streetViewControl: false, scrollwheel: false, mapTypeControl: false }
      };
      map = (<GoogleMapLoader
        containerElement={<div className={styles.mapView} />}
        googleMapElement={<GoogleMap {...mapProps}>
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
