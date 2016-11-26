import React, { PropTypes } from 'react';

import styles from './styles.css';

const KEY_ESC = 27;

export default class Modal extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    modal: PropTypes.object,
  };
  static propTypes = {
    modal: PropTypes.any,
  }
  render() {
    const { modal } = this.props;
    return (<div className={[styles.modal, modal ? styles.show : null].join(' ')}>
      <div className={styles.modalBG} onClick={this.context.modal.close} />
      <div className={styles.modalFG} onKeyUp={event => event.keyCode === KEY_ESC && this.context.modal.close()}>
        <a className={styles.close} onClick={this.context.modal.close}>×</a>
        {modal || null}
      </div>
    </div>);
  }
}
