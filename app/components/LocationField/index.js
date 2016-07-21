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
    hasChanged: React.PropTypes.func,
    defaultLocation: React.PropTypes.object,
    inputStyle: React.PropTypes.string,
    model: React.PropTypes.object,
    name: React.PropTypes.string.isRequired,
    dataName: React.PropTypes.string,
    value: React.PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = { clean: true };
  }
  componentDidMount() {
    const options = { types: ['geocode'] };
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
    this.setState({ clean: false });
    if (!(event.detail && event.detail === 'generated')) {
      event.stopPropagation();
      event.preventDefault();
    }
  }
  onPlaceChange = (place) => {
    const locationData = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    this.changeCenter(locationData);
    this.props.onValueChangeByName(this.props.name, place.formatted_address);
    this.props.onValueChangeByName(this.props.dataName, JSON.stringify(locationData));
    if (this.props.hasChanged) this.props.hasChanged();
    this.setState({ clean: true });
    const changeEvent = new Event('input', { bubbles: true, detail: 'generated' });
    this.refs.input.dispatchEvent(changeEvent);
  }
  onMapClick = (event) => {
    this.onPlaceChange({ formatted_address: this.props.model[this.props.name], geometry: { location: event.latLng } });
  }
  changeCenter = (locationData) => {
    if (this.refs.component) {
      this.refs.component.panTo(locationData);
    }
  }
  render() {
    const { model, name, dataName, inputStyle } = this.props;
    const attrs = {
      type: 'text',
      name,
      className: inputStyle,
      ref: 'input',
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      onChange: this.onChange,
      placeholder: model[name],
      defaultValue: model[name]
    };
    let map = null;
    const locationData = model[dataName] ? JSON.parse(model[dataName]) : null;
    if (locationData) {
      const marker = {
        position: locationData,
        icon: { url: '/images/map-pin-active.svg' },
        defaultAnimation: 2
      };
      const mapProps = {
        defaultZoom: 15,
        defaultCenter: locationData,
        center: locationData,
        ref: 'component',
        onClick: this.onMapClick
      };
      map = (<GoogleMapLoader
        containerElement={<div className={styles.mapView} />}
        googleMapElement={<GoogleMap {...mapProps}>
          <Marker {...marker} />
        </GoogleMap>}
      />);
    }
    return (<div>
      <input {...attrs} />
      {map}
    </div>);
  }
}
