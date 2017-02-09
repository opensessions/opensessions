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
    onClick: PropTypes.func,
    icon: PropTypes.string
  }
  act() {
    const { to, onClick } = this.props;
    if (onClick) onClick();
    if (to) this.context.router.push(to);
  }
  onClick = event => {
    event.stopPropagation();
    event.preventDefault();
    this.act();
  }
  render() {
    const { to, icon, children, className, style } = this.props;
    return (<a tabIndex={0} href={to} onClick={this.onClick} onKeyDown={e => e.keyCode === 13 && this.onClick(event)} onKeyUp={console.log} className={[styles.button, icon ? styles.hasIcon : null, className, style instanceof Array ? style.map(s => styles[s]).join(' ') : styles[style]].join(' ')}>
      {icon ? <img src={icon} role="presentation" /> : null}
      {children}
    </a>);
  }
}
