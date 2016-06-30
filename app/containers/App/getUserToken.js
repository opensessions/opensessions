const getUserToken = (lock) => {
  let idToken = localStorage.getItem('userToken');
  const authHash = lock.parseHash(window.location.hash);
  if (!idToken && authHash) {
    if (authHash.id_token) {
      idToken = authHash.id_token;
      localStorage.setItem('userToken', authHash.id_token);
    }
  }
  return idToken;
};

export default getUserToken;
