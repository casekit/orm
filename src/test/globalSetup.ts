import { migrator } from "..";
import { db } from "./db";

export default async function setup() {
    await migrator(db).implode({ dryRun: false, output: true });
}
