import React from 'react';
import styles from '../Field/styles.css';

export default class LocationField extends React.Component {
  static propTypes = {
    label: React.PropTypes.string,
    name: React.PropTypes.string,
    callback: React.PropTypes.func,
  }
  componentDidMount() {
    const options = { types: ['geocode'] };
    const element = this.refs.input;
    const autocomplete = new window.google.maps.places.Autocomplete(element, options);
    window.google.maps.event.addListener(autocomplete,
      'place_changed',
      () => (this.props.callback ? this.props.callback(autocomplete) : autocomplete.getPlace())
    );
  }
  render() {
    const { label, name } = this.props;
    return (
      <div className={styles.field}>
        <label className={styles.label}>{label}</label>
        <input {...this.props} type="text" label={label} name={name} ref="input" className={styles.input} />
      </div>
    );
  }
}
