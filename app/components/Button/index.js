import React, { PropTypes } from 'react';

import Tooltip from '../Tooltip';

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
    tip: PropTypes.string,
    onClick: PropTypes.func,
    icon: PropTypes.string
  }
  constructor() {
    super();
    this.state = {};
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
  renderLink() {
    const { to, icon, children, className, style } = this.props;
    return (<a tabIndex={0} href={to} onClick={this.onClick} onKeyDown={e => e.keyCode === 13 && this.onClick(event)} className={[styles.button, icon ? styles.hasIcon : null, className, style instanceof Array ? style.map(s => styles[s]).join(' ') : styles[style]].join(' ')}>
      {icon ? <img src={icon} role="presentation" /> : null}
      {children}
    </a>);
  }
  render() {
    const { tip } = this.props;
    const { isOpened } = this.state;
    if (tip) {
      return (<span style={{ position: 'relative' }} onMouseOver={() => this.setState({ isOpened: true })} onMouseOut={() => this.setState({ isOpened: false })}>
        <Tooltip tip={tip} isOpened={isOpened} style="dark" />
        {this.renderLink()}
      </span>);
    }
    return this.renderLink();
  }
}
