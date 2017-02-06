import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class SocialMedia extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    item: PropTypes.object
  }
  render() {
    const { item } = this.props;
    const { socialWebsite, socialFacebook, socialInstagram, socialTwitter, socialHashtag } = item;
    return (<ol className={styles.social}>
      {socialWebsite ? <li><a className={styles.link} href={socialWebsite}>{socialWebsite.replace(/^https?:\/\/(www\.)?/, '')}</a></li> : null}
      {socialFacebook ? <li><a className={styles.link} href={socialFacebook}><img src="/images/facebook.png" role="presentation" /> Facebook page</a></li> : null}
      {socialInstagram ? <li><a className={styles.link} href={`https://instagram.com/${socialInstagram.slice(1)}`}><img src="/images/instagram.png" role="presentation" /> {socialInstagram}</a></li> : null}
      {socialTwitter ? <li><a className={styles.link} href={`https://twitter.com/${socialTwitter.slice(1)}`}><img src="/images/twitter.png" role="presentation" /> {socialTwitter}</a></li> : null}
      {socialHashtag ? <li><a className={styles.link} href={`https://twitter.com/hashtag/${socialHashtag.slice(1)}`}>{socialHashtag}</a></li> : null}
    </ol>);
  }
}
