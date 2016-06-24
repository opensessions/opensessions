export function apiFetch(url, opts) {
  if (typeof opts !== 'object') opts = {};
  const query = opts.query;
  if (opts.body) {
    opts.headers = {
      'Content-Type': 'application/json',
    };
    opts.method = 'POST';
    opts.body = JSON.stringify(opts.body);
  }
  if (query) {
    url += '?';
    url += Object.keys(query)
     .map((key) => [encodeURIComponent(key), encodeURIComponent(query[key])].join('='))
     .join('&')
     .replace(/%20/g, '+');
  }
  opts.credentials = 'same-origin';
  return fetch(url, opts).then((response) => response.json());
}
