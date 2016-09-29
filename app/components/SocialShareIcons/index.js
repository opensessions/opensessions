import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class SocialShareIcons extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    link: PropTypes.string.isRequired,
    title: PropTypes.string,
  }
  render() {
    const link = encodeURIComponent(this.props.link);
    const title = encodeURIComponent(this.props.title);
    const icons = [
      { url: `http://www.facebook.com/share.php?u=${link}&title=${title}`, img: '/images/facebook.png' },
      { url: `http://twitter.com/home?status=${title}+${link}`, img: '/images/twitter.png' },
      { url: `mailto:?subject=${title}&body=${link}`, img: '/images/email.png' }
    ];
    return (<ol className={styles.socialIcons}>
      {icons.map(icon => <li key={icon.img}><a href={icon.url} target="blank"><img src={icon.img} role="presentation" /></a></li>)}
    </ol>);
  }
}
