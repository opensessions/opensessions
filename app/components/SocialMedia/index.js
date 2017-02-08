import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class SocialMedia extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    item: PropTypes.object
  }
  render() {
    const { item } = this.props;
    const { website, facebook, instagram, twitter, hashtag } = item;
    return (<ol className={styles.social}>
      {website ? <li><a className={styles.link} href={website}>{website.replace(/^https?:\/\/(www\.)?/, '')}</a></li> : null}
      {facebook ? <li><a className={styles.link} href={facebook}><img src="/images/facebook.png" role="presentation" /> Facebook page</a></li> : null}
      {instagram ? <li><a className={styles.link} href={`https://instagram.com/${instagram.slice(1)}`}><img src="/images/instagram.png" role="presentation" /> {instagram}</a></li> : null}
      {twitter ? <li><a className={styles.link} href={`https://twitter.com/${twitter.slice(1)}`}><img src="/images/twitter.png" role="presentation" /> {twitter}</a></li> : null}
      {hashtag ? <li><a className={styles.link} href={`https://twitter.com/hashtag/${hashtag.slice(1)}`}>{hashtag}</a></li> : null}
    </ol>);
  }
}
