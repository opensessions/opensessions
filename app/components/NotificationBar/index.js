import React, { PropTypes } from 'react';

import Sticky from '../Sticky';

import styles from './styles.css';

const ANIMATION_TIMEOUT = 200;
const ENTER_CLICK = { tabIndex: 0, onKeyUp: event => event.keyCode === 13 && event.target.click() };

export default class NotificationBar extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    zIndex: PropTypes.number,
    storeName: PropTypes.string,
    orientation: PropTypes.string
  };
  static contextTypes = {
    store: PropTypes.object
  }
  componentDidMount() {
    this.unhideMessages();
    this.unsubscribe = this.context.store.subscribe(() => this.forceUpdate());
  }
  componentDidUpdate() {
    this.unhideMessages();
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  onDismiss = event => {
    const { target } = event;
    const { id } = target.dataset;
    if (id) {
      target.parentNode.parentNode.classList.add(styles.dismissed);
      setTimeout(() => {
        this.dismiss(id);
      }, ANIMATION_TIMEOUT);
    }
  }
  getNotifications() {
    return this.context.store.getState().get(this.props.storeName || 'notifications');
  }
  getItems() {
    let items = [];
    Array.map(document.getElementsByClassName(styles.messages), list => {
      items = items.concat(Array.map(list.children, li => li));
    });
    return items;
  }
  dismiss = id => {
    this.getNotifications().filter(msg => msg.id == id).forEach(msg => msg.onDismiss()); // eslint-disable-line eqeqeq
  }
  unhideMessages() {
    setTimeout(() => {
      this.getItems().forEach(li => {
        li.classList.remove(styles.hidden);
      });
    }, 30);
    this.getNotifications().forEach(notification => {
      if (notification.timeout) {
        const targets = this.getItems().filter(item => item.dataset.id == notification.id); // eslint-disable-line eqeqeq
        setTimeout(() => {
          targets.forEach(li => li.classList.add(styles.dismissed));
          setTimeout(() => {
            this.dismiss(notification.id);
          }, ANIMATION_TIMEOUT);
        }, notification.timeout);
      }
    });
  }
  renderNotification(message) {
    const { id, status, text, actions } = message;
    const fullActions = actions.filter(action => action.type === 'full');
    const clickFull = () => {
      fullActions.forEach(action => action.dispatch());
      this.dismiss(id);
    };
    const tooltip = fullActions.length ? fullActions[0].tooltip : null;
    return (<li key={id} data-id={id} className={[styles.hidden, styles[status || 'standard']].join(' ')} onClick={actions && actions.some(action => action.type === 'full') ? (event => event.target.tagName !== 'A' && clickFull()) : null}>
      <div className={styles.inner}>
        {typeof text === 'object' ? <span className={styles.text}>{text}</span> : <span className={styles.text} dangerouslySetInnerHTML={{ __html: text }} />}
        {actions && actions.some(action => action.type !== 'full')
          ? <span className={styles.actions}>{actions.map((action, key) => <a key={key} {...ENTER_CLICK} onClick={() => action.dispatch() && this.dismiss(id)} autoFocus>{action.text}</a>)}</span>
          : null}
        <a {...ENTER_CLICK} onClick={this.onDismiss} data-id={id} className={styles.dismiss}>&times;</a>
      </div>
      {tooltip ? <div className={styles.tooltip}><div className={styles.tip}>{tooltip}</div></div> : null}
    </li>);
  }
  render() {
    const { zIndex, orientation } = this.props;
    const notifications = this.getNotifications();
    return (<Sticky zIndex={zIndex || 2}>
      <ol className={styles.messages} data-orientation={orientation || 'top'}>
        {notifications ? notifications.map(message => this.renderNotification(message)) : null}
      </ol>
    </Sticky>);
  }
}
