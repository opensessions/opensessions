import React, { PropTypes } from 'react';

import Sticky from '../Sticky';

import styles from './styles.css';

const ANIMATION_TIMEOUT = 200;

export default class NotificationBar extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    zIndex: PropTypes.number
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
  getItems() {
    let items = [];
    Array.map(document.getElementsByClassName(styles.messages), list => {
      items = items.concat(Array.map(list.children, li => li));
    });
    return items;
  }
  dismiss = id => {
    this.context.store.getState().get('notifications').filter(msg => msg.id == id).forEach(msg => msg.onDismiss()); // eslint-disable-line eqeqeq
  }
  unhideMessages() {
    setTimeout(() => {
      this.getItems().forEach(li => {
        li.classList.remove(styles.hidden);
      });
    }, 30);
    this.context.store.getState().get('notifications').forEach(notification => {
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
  render() {
    const { zIndex } = this.props;
    const notifications = this.context.store.getState().get('notifications');
    // const { notifications } = this.props;
    return (<Sticky zIndex={zIndex || 2}>
      <ol className={styles.messages}>
        {notifications ? notifications.map(message => (<li key={message.id} data-id={message.id} className={[styles.hidden, styles[message.status || 'standard']].join(' ')}>
          <div className={styles.inner}>
            {typeof message.text === 'object' ? <span className={styles.text}>{message.text}</span> : <span className={styles.text} dangerouslySetInnerHTML={{ __html: message.text }} />}
            {message.actions ? <span className={styles.actions}>{message.actions.map((action, key) => <a key={key} tabIndex={0} onKeyUp={event => event.keyCode === 13 && event.target.click()} onClick={() => action.dispatch() && this.dismiss(message.id)} autoFocus>{action.text}</a>)}</span> : null}
            <a tabIndex={0} onKeyUp={event => event.keyCode === 13 && event.target.click()} onClick={this.onDismiss} data-id={message.id} className={styles.dismiss}>&times;</a>
          </div>
        </li>)) : null}
      </ol>
    </Sticky>);
  }
}
