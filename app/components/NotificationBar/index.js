import React, { PropTypes } from 'react';

import Sticky from 'components/Sticky';

import styles from './styles.css';

export default class NotificationBar extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    notifications: PropTypes.arrayOf(PropTypes.shape({
      text: PropTypes.string,
      onDismiss: PropTypes.func,
      status: PropTypes.oneOf(['success', 'error', 'warn', 'standard'])
    })),
    zIndex: PropTypes.number
  }
  render() {
    const { notifications, zIndex } = this.props;
    return (<Sticky zIndex={zIndex || 2}>
      <ol className={styles.messages}>
        {notifications.map(message => (<li className={styles[message.status || 'standard']}>
          <div className={styles.inner}>
            {typeof message.text === 'object' ? <span>{message.text}</span> : <span dangerouslySetInnerHTML={{ __html: message.text }} />}
            <a onClick={message.onDismiss} className={styles.dismiss}>&times;</a>
          </div>
        </li>))}
      </ol>
    </Sticky>);
  }
}
