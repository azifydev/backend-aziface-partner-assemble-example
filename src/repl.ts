import { repl } from '@nestjs/core';

import { AppModule } from './app.module';

/**
 * Bootstraps the REPL (Read-Eval-Print Loop) for the application.
 * This function initializes the REPL with the AppModule, allowing
 * for interactive execution of commands and queries against the application.
 *
 * @async
 * @function bootstrap
 * @returns {Promise<void>} A Promise that resolves when the REPL has been started.
 */
async function bootstrap(): Promise<void> {
  await repl(AppModule);
}
void bootstrap();
