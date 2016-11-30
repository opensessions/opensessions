import React, { PropTypes } from 'react';

import GenericModal from '../Generic';
import Button from '../../../components/Button';
import Checkbox from '../../../components/Fields/Checkbox';

import { apiFetch } from '../../../utils/api';

import styles from './styles.css';

export default class FeatureModal extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    modal: PropTypes.object,
    user: PropTypes.object
  };
  static propTypes = {
    feature: PropTypes.string
  }
  constructor(props) {
    super();
    this.state = { notify: false };
    const { user } = this.context;
    apiFetch('/hooks/feature-dialog', { body: { feature: props.feature, email: user.email, name: user.nickname } });
  }
  send() {
    if (this.state.notify) {
      const { user } = this.context;
      apiFetch('/hooks/feature', { body: { feature: this.props.feature, email: user.email, name: user.nickname } }).then(() => {
        this.context.modal.dispatch({ component: (<GenericModal>
          <h1><b>Great!</b></h1>
          <p>You will be notified when the feature is available</p>
          <p><span className={styles.sentTick}><img alt="tick" src="/images/tick.svg" /></span></p>
          <p>Thanks for your continued engagement in Open Sessions!</p>
          <br />
          <p><Button onClick={this.context.modal.close}>Close</Button></p>
        </GenericModal>) });
      }).catch(error => {
        alert(error.error);
      });
    } else {
      this.context.modal.close();
    }
  }
  render() {
    const { feature } = this.props;
    return (<GenericModal size="large">
      <div className={styles.feature}>
        <h2>The following feature is not yet available:</h2>
        <h3>{feature}</h3>
        <br />
        <p>Open Sessions is still in its 'beta' phase. This means we're still hard at work adding new features to improve your experience.</p>
        <p>It's been noted that you were looking for this feature. Thank you for helping to improve Open Sessions!</p>
        <br />
        <p><Checkbox label="Tick this box if you would like to be notified when this feature is added" checked={this.state.notify} onChange={() => this.setState({ notify: !this.state.notify })} /></p>
        <Button onClick={() => this.send()}>OK</Button>
      </div>
    </GenericModal>);
  }
}
