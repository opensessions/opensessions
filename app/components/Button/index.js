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
    if (to && event.type === 'click') {
      this.context.router.push(to);
    } else {
      onClick();
    }
  }
  render() {
    const { to, children, className, style } = this.props;
    return (<a tabIndex={0} href={to} onClick={this.onClick} onKeyDown={e => e.keyCode === 13 && this.onClick(event)} className={[styles.button, className, style instanceof Array ? style.map(s => styles[s]).join(' ') : styles[style]].join(' ')}>
      {children}
    </a>);
  }
}
