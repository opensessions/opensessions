import React from 'react';

import styles from './styles.css';

export default class LoginPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    history: React.PropTypes.object,
  }
  static contextTypes = {
    user: React.PropTypes.object,
    lock: React.PropTypes.object,
  }
  constructor() {
    super();
    this.showLock = this.showLock.bind(this);
  }
  componentDidMount() {
    this.showLock();
  }
  showLock() {
    const { lock } = this.context;
    lock.show({
      icon: '/images/app-icon.png',
      socialBigButtons: true
    });
  }
  render() {
    return (
      <div className={styles.container}>
        <p><a onClick={this.showLock}>Show login form</a></p>
        <p><a onClick={this.props.history.goBack}>Back</a></p>
      </div>
    );
  }
}
