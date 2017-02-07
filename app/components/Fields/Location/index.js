import React, { PropTypes } from 'react';

import { withGoogleMap } from 'react-google-maps';
import GoogleMap from 'react-google-maps/lib/GoogleMap';
import Marker from 'react-google-maps/lib/Marker';

import styles from './styles.css';

const GoogleMapLoader = withGoogleMap(props => (
  <GoogleMap {...props.mapProps}>
    <Marker {...props.marker} />
  </GoogleMap>
));

export default class LocationField extends React.Component {
  static contextTypes = {
    notify: PropTypes.func
  };
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    defaultLocation: PropTypes.object,
    className: PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = { clean: true };
  }
  componentDidMount() {
    const { LOCALE_COUNTRY } = window;
    const options = { types: [], componentRestrictions: { country: LOCALE_COUNTRY } };
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
    if (!place.geometry) {
      this.context.notify('No map data for this location; please try a different address', 'error');
      return;
    }
    this.latLngChange(place.geometry.location, { placeID: place.place_id });
    this.props.onChange({ ...this.props.value, address: this.placeToAddress(place) });
    this.setState({ clean: true });
  }
  placeToAddress(place) {
    const { name } = place;
    const address = place.formatted_address;
    return address.indexOf(name) === -1 ? [name, address].join(', ') : address;
  }
  latLngChange = (latLng, extraData) => {
    const data = {
      lat: latLng.lat(),
      lng: latLng.lng(),
      ...extraData
    };
    this.changeCenter(data);
    this.props.onChange({ ...this.props.value, data });
  }
  changeCenter = data => {
    if (this.refs.component) {
      this.refs.component.state.map.panTo(data);
    }
  }
  generateManual(value) {
    return value ? value.split(', ') : [];
  }
  renderSearch(value) {
    const { className } = this.props;
    const { isManual } = this.state;
    const attrs = {
      type: 'text',
      className,
      ref: 'input',
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      onChange: this.onChange,
      placeholder: value.address,
      defaultValue: value.address
    };
    return (<span style={{ display: isManual ? 'none' : 'block' }}>
      <input {...attrs} />
      <a className={styles.toggle} onClick={() => this.setState({ isManual: true })}>Can't find the location you're looking for in the dropdown?</a>
    </span>);
  }
  renderManual() {
    const { className } = this.props;
    let { value } = this.props;
    if (!value) value = {};
    let { data } = value;
    if (!data) data = {};
    const attrs = {
      type: 'text',
      className,
    };
    const manual = data.manual || this.generateManual(value.address);
    const getAttrs = index => ({
      ...attrs,
      onChange: event => {
        if (!data.manual) data.manual = [];
        data.manual[index] = event.target.value;
        this.props.onChange({ ...value, data });
      },
      value: manual[index]
    });
    return (<span className={styles.manual}>
      <p className={styles.help}>Please enter an address then position the map pin manually</p>
      <label>Venue name and street</label>
      <input {...getAttrs(0)} />
      <input {...getAttrs(1)} />
      <label>Town or city</label>
      <input {...getAttrs(2)} />
      <label>County (optional)</label>
      <input {...getAttrs(3)} />
      <label>Postcode</label>
      <input {...getAttrs(4)} />
      <a
        className={styles.toggle}
        onClick={() => {
          delete data.manual;
          this.props.onChange({ ...value, data });
          this.setState({ isManual: false });
        }}
      >Return to location search</a>
    </span>);
  }
  render() {
    let { value } = this.props;
    if (!value) value = {};
    const { data } = value;
    let { isManual } = this.state;
    let map = null;
    let mapHelp = null;
    if (data) {
      if (data.manual) isManual = true;
      const marker = {
        position: data,
        icon: { url: '/images/map-pin-active.svg' },
        defaultAnimation: 2,
        draggable: true,
        cursor: '-webkit-grab, move',
        onDragEnd: drag => {
          this.latLngChange(drag.latLng);
        }
      };
      const mapProps = {
        defaultZoom: 15,
        defaultCenter: data,
        center: data,
        draggableCursor: '-webkit-grab, move',
        options: { streetViewControl: false, scrollwheel: false, mapTypeControl: false }
      };
      map = (<GoogleMapLoader
        containerElement={<div className={styles.mapView} />}
        mapElement={<div style={{ height: '100%' }} />}
        mapProps={mapProps}
        marker={marker}
        ref="component"
      />);
      mapHelp = <p className={styles.dragHelp}>Drag map pin to refine location</p>;
    }
    return (<div>
      {isManual ? this.renderManual() : null}
      {this.renderSearch(value)}
      {map}
      {mapHelp}
    </div>);
  }
}
