module.exports = (app) => {
  app.get('/api/session/:sessionID', (req, res) => {
    res.json({
      title: 'mock title',
      description: 'mock description',
    });
  });
};
