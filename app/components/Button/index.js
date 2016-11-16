import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class Button extends React.PureComponent {
  static contextTypes = {
    router: PropTypes.object,
  };
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    to: PropTypes.string,
    onClick: PropTypes.func
  }
  onClick = () => {
    const { to, onClick } = this.props;
    if (to) {
      this.context.router.push(to);
    } else {
      onClick();
    }
  }
  render() {
    return (<a onKeyUp={event => event.keyCode === 13 && this.onClick()} onClick={this.onClick} className={[styles.button, this.props.className].join(' ')} tabIndex={0}>
      {this.props.children}
    </a>);
  }
}
