function apiFetch(url, opts) {
  return new Promise((resolve, reject) => {
    if (typeof opts !== 'object') opts = {};
    const query = opts.query;
    const headers = opts.headers || {};
    headers.Authorization = `bearer ${localStorage.userToken}`;
    if (opts.body) {
      opts.method = 'POST';
      if (!(opts.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(opts.body);
      }
    }
    if (query) {
      url += '?';
      url += Object.keys(query)
       .map((key) => [encodeURIComponent(key), encodeURIComponent(query[key])].join('='))
       .join('&')
       .replace(/%20/g, '+');
    }
    opts.credentials = 'same-origin';
    opts.crossDomain = true;
    opts.headers = headers;
    fetch(url, opts).then(response => {
      response.json().then(json => {
        if (response.ok) {
          resolve(json);
        } else {
          reject(json);
        }
      });
    });
  });
}

const apiModel = {
  get(model, uuid) {
    return apiFetch(`/api/${model}/${uuid}`);
  },
  search(model, query) {
    return apiFetch(`/api/${model}`, { query });
  },
  new(model, body) {
    return apiFetch(`/api/${model}/create`, { body });
  },
  edit(model, uuid, body) {
    return apiFetch(`/api/${model}/${uuid}`, { body });
  },
  delete(model, uuid) {
    return apiFetch(`/api/${model}/${uuid}/delete`);
  },
  upload(url, body) {
    return apiFetch(url, { body });
  }
};

export { apiFetch, apiModel };
