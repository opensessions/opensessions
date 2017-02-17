const runDatabaseCleanup = database => {
  console.log('Running database cleanup');
  const cleanWhere = { createdAt: { $col: 'updatedAt' }, state: 'draft' };
  database.models.Session.findAll({ where: cleanWhere }).then(sessions => {
    console.log(`Deleting ${sessions.length} sessions`);
    return database.models.Session.destroy({ where: cleanWhere });
  });
};

module.exports = { runDatabaseCleanup };
