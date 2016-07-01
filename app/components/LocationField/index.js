import React from 'react';
import styles from '../Field/styles.css';

export default class LocationField extends React.Component {
  static propTypes = {
    label: React.PropTypes.string,
    name: React.PropTypes.string,
    callback: React.PropTypes.func,
  }
  constructor(props) {
    super(props);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }
  componentDidMount() {
    const options = { types: ['geocode'] };
    const element = this.refs.input;
    const autocomplete = new window.google.maps.places.Autocomplete(element, options);
    window.google.maps.event.addListener(autocomplete,
      'place_changed',
      () => {
        this.setState({ clean: true });
        return this.props.callback ? this.props.callback(autocomplete) : autocomplete.getPlace();
      }
    );
  }
  onBlur(event) {
    if (!this.state.clean) {
      event.target.value = '';
    }
  }
  onFocus() {
    this.setState({ clean: false });
  }
  render() {
    const { label, name } = this.props;
    const attrs = {
      type: 'text',
      label,
      name,
      ref: 'input',
      onBlur: this.onBlur,
      onChange: this.onFocus
    };
    return (
      <div className={styles.field}>
        <label className={styles.label}>{label}</label>
        <input {...attrs} className={styles.input} />
      </div>
    );
  }
}
