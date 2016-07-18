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
    defaultLocation: React.PropTypes.object,
    inputStyle: React.PropTypes.string,
    name: React.PropTypes.string.isRequired,
    value: React.PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = {
      clean: true,
      location: props.defaultLocation
    };
  }
  componentDidMount() {
    const options = { types: ['geocode'] };
    const element = this.refs.input;
    const autocomplete = new window.google.maps.places.Autocomplete(element, options);
    window.google.maps.event.addListener(autocomplete,
      'place_changed',
      () => {
        const place = autocomplete.getPlace();
        const loc = place.geometry.location;
        const location = { lat: loc.lat(), lng: loc.lng() };
        this.changeCenter(location);
        this.setState({ clean: true, location });
        if (this.props.onChange) this.props.onChange(place);
        return place;
      }
    );
  }
  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.defaultLocation) !== JSON.stringify(this.state.location)) {
      this.setState({
        location: nextProps.defaultLocation
      });
    }
  }
  onBlur = (event) => {
    if (!this.state.clean) {
      event.target.value = '';
    }
    if (this.props.onBlur) this.props.onBlur(event);
  }
  onFocus = (event) => {
    if (this.props.onFocus) this.props.onFocus(event);
  }
  onChange = () => {
    this.setState({ clean: false });
  }
  changeCenter = (location) => {
    if (this.refs.component) {
      this.refs.component.panTo(location);
    }
  }
  render() {
    const attrs = {
      type: 'text',
      className: this.props.inputStyle,
      ref: 'input',
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      onChange: this.onChange,
      placeholder: this.props.value
    };
    let map = null;
    if (this.state.location) {
      const center = this.state.location;
      const marker = {
        position: center,
        icon: { url: '/images/map-pin-active.svg' },
        defaultAnimation: 2
      };
      map = (<GoogleMapLoader
        containerElement={<div className={styles.mapView} />}
        googleMapElement={
          <GoogleMap
            defaultZoom={15}
            defaultCenter={center}
            center={center}
            ref="component"
          >
            <Marker {...marker} />
          </GoogleMap>
        }
      />);
    }
    return (<div>
      <input {...attrs} />
      {map}
    </div>);
  }
}
