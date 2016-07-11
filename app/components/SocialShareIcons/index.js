import React from 'react';

import styles from './styles.css';

export default class SocialShareIcons extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    link: React.PropTypes.string.isRequired,
    title: React.PropTypes.string,
  }
  render() {
    const { link, title } = this.props;
    const icons = [
      { url: `http://www.facebook.com/share.php?u=${link}&title=${title}`, img: '/images/facebook.png' },
      { url: `http://twitter.com/home?status=${title}+${link}`, img: '/images/twitter.png' },
      { url: `mailto:?subject=${title}&body=${link}`, img: '/images/email.png' }
    ];
    return (<ol className={styles.socialIcons}>
      {icons.map((icon) => <li key={icon.img}><a href={icon.url}><img src={icon.img} role="presentation" /></a></li>)}
    </ol>);
  }
}
