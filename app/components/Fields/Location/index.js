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

const { LOCALE_COUNTRY, google } = window;
const KEY_ENTER = 13;

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
    const options = { types: [], componentRestrictions: { country: LOCALE_COUNTRY } };
    const { input } = this.refs;
    const { maps } = google;
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
    event.preventDefault();
    event.stopPropagation();
    this.setState({ clean: false });
  }
  onPlaceChange = place => {
    if (!place.geometry) {
      this.context.notify('No map data for this location! Please try a different address', 'error');
      return;
    }
    this.latLngChange(place.geometry.location, { placeID: place.place_id });
    this.props.onChange({ ...this.props.value, address: this.placeToAddress(place) });
    this.setState({ clean: true });
  }
  setManual() {
    const { onChange, value } = this.props;
    onChange({ ...value, data: Object.assign({}, value.data, { manual: this.generateManual(value.address) }) });
  }
  placeToAddress(place) {
    const { name } = place;
    const address = place.formatted_address;
    return address.indexOf(name) === -1 ? [name, address].join(', ') : address;
  }
  latLngChange = (latLng, extraData) => {
    const initialData = this.props.value ? this.props.value.data : {};
    const data = {
      ...initialData,
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
    const isManual = value.data && value.data.manual;
    const attrs = {
      type: 'text',
      className,
      ref: 'input',
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      onChange: this.onChange,
      onKeyPress: event => {
        if (event.charCode === KEY_ENTER) {
          event.stopPropagation();
          event.preventDefault();
        }
      },
      placeholder: value.address,
      defaultValue: value.address
    };
    let manualText = <p className={styles.toggle}>To complete this field, search for a nearby location and move the map pin to the location of your session</p>;
    if (value.data && value.data.lat && value.data.lng) manualText = null;
    return (<div className={styles.searchBox}>
      <input {...attrs} />
      {value.address ? <a
        onClick={() => {
          this.props.onChange({ address: '', data: {} });
          this.refs.input.value = '';
        }}
        className={styles.reset}
      >×</a> : null}
      {isManual
        ? manualText
        : <a className={styles.toggle} onClick={() => this.setManual()}>Can't find the location you're looking for in the dropdown?</a>}
    </div>);
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
    const manual = data.manual;
    const getAttrs = index => ({
      ...attrs,
      onChange: event => {
        if (!data.manual) data.manual = [];
        data.manual[index] = event.target.value;
        this.props.onChange({ ...value, data });
      },
      onBlur: () => {
        const newVal = [manual[2], manual[4]].filter(v => v).join(', ');
        if (newVal && (index === 2 || index === 4) && !(data.lat && data.lng)) {
          this.refs.input.value = newVal;
        }
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
        }}
      >Return to location search</a>
    </span>);
  }
  render() {
    let { value } = this.props;
    if (!value) value = {};
    const { data } = value;
    const { dragPrompt } = this.state;
    let isManual = false;
    let map = null;
    let mapHelp = null;
    if (data) {
      if (data.manual) isManual = true;
      if (data.lat && data.lng) {
        const marker = {
          position: data,
          icon: { url: '/images/map-pin-active.svg' },
          defaultAnimation: 2,
          draggable: true,
          onMouseOver: () => this.setState({ dragPrompt: true }),
          onMouseOut: () => this.setState({ dragPrompt: false }),
          onDragEnd: drag => {
            this.latLngChange(drag.latLng);
          }
        };
        const mapProps = {
          defaultZoom: 15,
          defaultCenter: data,
          center: data,
          options: { streetViewControl: false, scrollwheel: false, mapTypeControl: false }
        };
        map = (<GoogleMapLoader
          containerElement={<div className={styles.mapView} />}
          mapElement={<div style={{ height: '100%' }} />}
          mapProps={mapProps}
          marker={marker}
          ref="component"
        />);
        mapHelp = <p className={[styles.dragHelp, dragPrompt ? styles.dragPrompt : ''].join(' ')}>Drag map pin to refine location</p>;
      }
    }
    return (<div>
      {isManual ? this.renderManual() : null}
      {this.renderSearch(value)}
      {map}
      {mapHelp}
    </div>);
  }
}
