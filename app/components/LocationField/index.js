import React from 'react';
import styles from '../Field/styles.css';

export default class LocationField extends React.Component {
  static propTypes = {
    label: React.PropTypes.string,
    name: React.PropTypes.string.isRequired,
    callback: React.PropTypes.func,
    value: React.PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.state = {
      clean: true
    };
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
      name,
      ref: 'input',
      onBlur: this.onBlur,
      onChange: this.onFocus,
      placeholder: this.props.value
    };
    return (
      <div className={styles.field}>
        <label className={styles.label}>{label}</label>
        <input {...attrs} className={styles.input} />
      </div>
    );
  }
}
