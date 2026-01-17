import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { dbDrop } from "#commands/db-drop.js";
import { dbPush } from "#commands/db-push.js";
import { dbPull } from "./commands/db-pull.js";
import { generateModel } from "./commands/generate-model.js";
import { init } from "./commands/init.js";
import { globalOptions } from "./options.js";

await yargs(hideBin(process.argv))
    .strict(true)
    .scriptName("orm")
    .options(globalOptions)
    .command("db", "Commands for managing your database", (yargs) =>
        yargs.command(dbDrop).command(dbPush).command(dbPull),
    )
    .command("generate", "Commands for generating files", (yargs) =>
        yargs.command(generateModel),
    )
    .command(init)
    .help()
    .showHelpOnFail(true)
    .demandCommand()
    .recommendCommands()
    .parse();

process.exit();
