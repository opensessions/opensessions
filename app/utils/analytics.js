/**
 * Analytics: simply tracks whatever href and pathname is passed
 */

import { IntercomAPI } from 'react-intercom';

export default function trackPage(href, pathname) {
  const { analytics } = window;
  if (analytics) {
    const generalise = (str) => !str ? '' : str.replace(/^(.*session\/)([^\/]*)((?:\/edit)?)$/gi, '$1*$3');
    const generalHref = generalise(href);
    const generalPathname = generalise(pathname);
    analytics.page(generalPathname, {
      title: generalPathname,
      url: generalHref,
      path: generalPathname
    });
  }

  IntercomAPI('trackEvent', 'page-nav', {
    'New location': pathname
  });
}
