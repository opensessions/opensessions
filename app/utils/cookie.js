const cookie = {
  all: () => {
    const cookies = {};
    document.cookie.split('; ').forEach(line => {
      const [key, value] = line.split('=');
      cookies[key] = value;
    });
    return cookies;
  },
  one: name => cookie.all()[name],
  has: name => document.cookie.indexOf(name) !== -1,
  set: (name, value) => {
    document.cookie = [name, value].join('=');
  }
};

export default cookie;
