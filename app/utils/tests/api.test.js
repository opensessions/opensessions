import expect from 'expect';

import {
  apiFetch
} from 'utils/api';

describe('apiFetch', () => {
  it('given a url, should return a promise that returns parsed json', () => {
    apiFetch('http://localhost:3000/api/session').then((response) => {
      expect(typeof response).toEqual('object');
    });
  });
});
