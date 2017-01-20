import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class Button extends React.PureComponent {
  static contextTypes = {
    router: PropTypes.object,
  };
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    style: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    to: PropTypes.string,
    onClick: PropTypes.func
  }
  onClick = event => {
    const { to, onClick } = this.props;
    event.stopPropagation();
    event.preventDefault();
    if (to) {
      this.context.router.push(to);
    } else {
      onClick();
    }
  }
  render() {
    const { to, children, className, style } = this.props;
    return (<a className={[styles.button, className, style instanceof Array ? style.map(s => styles[s]).join(' ') : styles[style]].join(' ')} onKeyUp={e => e.keyCode === 13 && this.onClick(event)} onClick={this.onClick} tabIndex={0} href={to}>
      {children}
    </a>);
  }
}
