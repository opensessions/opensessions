function apiFetch(url, opts) {
  const { localStorage } = window;
  const base = process.env.SERVICE_LOCATION;
  return new Promise((resolve, reject) => {
    if (typeof opts !== 'object') opts = {};
    const query = opts.query;
    const headers = opts.headers || {};
    headers.Authorization = `bearer ${localStorage ? localStorage.userToken : null}`;
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
    fetch(`${base}${url}`, opts).then(response => {
      response.json().then(json => {
        if (response.ok) {
          resolve(json);
        } else {
          reject(json);
        }
      }).catch(error => reject({ status: response.status, error }));
    }).catch(error => reject({ status: 'error', error }));
  });
}

const apiModel = {
  model: name => ({
    act: (action, body) => apiFetch(`/api/${name}/action/${action}`, { body }),
    instance: id => ({
      get: query => apiFetch(`/api/${name}/${id}`, { query }),
      act: (action, body) => apiFetch(`/api/${name}/${id}/${action}`, { body })
    })
  }),
  search(model, query) {
    return apiFetch(`/api/${model}`, { query });
  },
  new(model, body) {
    return apiModel.model(model).act('new', body);
  },
  get(model, uuid, query) {
    return apiFetch(`/api/${model}/${uuid}`, { query });
  },
  edit(model, uuid, body) {
    return apiFetch(`/api/${model}/${uuid}`, { body });
  },
  delete(model, uuid) {
    return apiModel.action(model, uuid, 'delete');
  },
  action(model, uuid, action, body) {
    return apiFetch(`/api/${model}/${uuid}/action/${action}`, { body });
  },
  upload(url, body) {
    return apiFetch(url, { body });
  }
};

export { apiFetch, apiModel };
