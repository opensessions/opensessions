const parseHash = hash => {
  const obj = {};
  hash.split('&').map(frag => frag.split('=')).forEach(frag => {
    obj[frag[0]] = frag[1];
  });
  return obj;
};

const getUserToken = () => {
  let userToken = localStorage.getItem('userToken');
  if (!userToken) {
    const authHash = parseHash(window.location.hash);
    if (authHash && authHash.id_token) {
      userToken = authHash.id_token;
      localStorage.setItem('userToken', authHash.id_token);
    }
  }
  return userToken;
};

export default getUserToken;
