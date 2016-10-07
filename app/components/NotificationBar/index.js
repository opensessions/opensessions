import React, { PropTypes } from 'react';

import Sticky from '../Sticky';

import styles from './styles.css';

export default class NotificationBar extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    notifications: PropTypes.arrayOf(PropTypes.shape({
      text: PropTypes.node,
      onDismiss: PropTypes.func,
      status: PropTypes.oneOf(['success', 'error', 'warn', 'standard'])
    })),
    zIndex: PropTypes.number
  }
  componentDidMount() {
    this.unhideMessages();
  }
  componentDidUpdate() {
    this.unhideMessages();
  }
  onDismiss = event => {
    const { target } = event;
    const { id } = target.dataset;
    if (id) {
      target.parentNode.parentNode.classList.add(styles.hidden);
      setTimeout(() => {
        this.dismiss(id);
      }, 200);
    }
  }
  dismiss = id => {
    this.props.notifications.find(msg => msg.id == id).onDismiss(); // eslint-disable-line eqeqeq
  }
  unhideMessages() {
    setTimeout(() => {
      Array.forEach(document.getElementsByClassName(styles.messages), messageList => {
        Array.forEach(messageList.children, li => {
          li.classList.remove(styles.hidden);
        });
      });
    }, 30);
  }
  render() {
    const { notifications, zIndex } = this.props;
    return (<Sticky zIndex={zIndex || 2}>
      <ol className={styles.messages}>
        {notifications.map(message => (<li key={message.id} className={[styles.hidden, styles[message.status || 'standard']].join(' ')}>
          <div className={styles.inner}>
            {typeof message.text === 'object' ? <span className={styles.text}>{message.text}</span> : <span className={styles.text} dangerouslySetInnerHTML={{ __html: message.text }} />}
            {message.actions ? <span className={styles.actions}>{message.actions.map(action => <a onClick={() => action.dispatch() && this.dismiss(message.id)}>{action.text}</a>)}</span> : null}
            <a onClick={this.onDismiss} data-id={message.id} className={styles.dismiss}>&times;</a>
          </div>
        </li>))}
      </ol>
    </Sticky>);
  }
}
