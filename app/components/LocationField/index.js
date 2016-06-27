import React from 'react';
import CSSModules from 'react-css-modules';
import styles from '../Field/styles.css';

const CSSModulesOptions = {
  allowMultiple: true,
};

@CSSModules(styles, CSSModulesOptions)
export default class LocationField extends React.Component {
  static propTypes = {
    label: React.PropTypes.string,
    name: React.PropTypes.string
  }
  componentDidMount() {
    const options = { types: ['geocode'] };
    const element = this.refs.input;
    const autocomplete = new window.google.maps.places.Autocomplete(element, options);
    window.google.maps.event.addListener(autocomplete, 'place_changed', () => {
      window.result = autocomplete.getPlace();
    });
  }
  render() {
    const { label, name } = this.props;
    return (<div styleName="field">
      <label styleName="label">{label}</label>
      <input {...this.props} label={label} name={name} ref="input" styleName="input" />
    </div>);
  }
}
