import React, { PropTypes } from 'react';

import trackPage from '../../utils/analytics';

import styles from './styles.css';

export default class SocialShareIcons extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    link: PropTypes.string.isRequired,
    title: PropTypes.string,
    message: PropTypes.string,
  }
  render() {
    const link = encodeURIComponent(this.props.link);
    const title = encodeURIComponent(this.props.title);
    const message = encodeURIComponent(this.props.message);
    const icons = [
      { id: 'facebook', url: `http://www.facebook.com/share.php?u=${link}&title=${title}`, img: '/images/facebook.png' },
      { id: 'twitter', url: `http://twitter.com/home?status=${title}+${link}`, img: '/images/twitter.png' },
      { id: 'email', url: `mailto:?subject=${title}&body=${message}%0A%0A${link}`, img: '/images/email.png' }
    ];
    return (<ol className={styles.socialIcons}>
      {icons.map(icon => <li key={icon.img}><a onClick={() => trackPage(window.location.href, `/special:share/${icon.id}?url=${link}`)} href={icon.url} target="blank"><img src={icon.img} role="presentation" /></a></li>)}
    </ol>);
  }
}
