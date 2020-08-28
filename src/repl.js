const repl = require('repl');
const { knex } = require('./modifiers')

// Base loading function for resetting the environment
const loader = async (ctx) => {
  Object.entries(ctx.modules).forEach(([module, filePath]) => {
    delete require.cache[require.resolve(filePath)];
    ctx[module] = require(filePath);
  })
  
  ctx.modifiers.forEach(mod => mod(ctx));
}

const cli = repl.start({
    prompt: "node::local> ",
    replMode: repl.REPL_MODE_STRICT,
    ignoreUndefined: true,
    useGlobal: true,
    useColors: true,
  })
  .on('exit', () => {
    console.log('Goodbye!');
    process.exit();
  });

// Persist command history
cli.setupHistory('.node_repl_history', (err, repl) => {
  if (err) {
    console.log(err);
  }
});

// Files to require in the REPL for access
cli.context.modules = {
  knex: './src/db/connection',
}

// Functions to modify the REPL environment
cli.context.modifiers = [
  knex.logger,
]

// Reload context with the .reload command
cli.defineCommand('reload', {
  help: 'Reload environment',
  action() {
    loader(this.context);
    this.displayPrompt();
  }
});

// Initialize modules and modifiers on first load
loader(cli.context);
