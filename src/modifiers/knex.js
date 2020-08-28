module.exports = {
  logger: ctx => {
    ctx.knex.on('query', ({ bindings, sql }) => {
      console.log('knex>', `${sql} (${bindings.join(', ')})`);
    });
  },
};

