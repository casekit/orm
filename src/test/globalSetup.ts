import { migrator } from "..";
import { db } from "./fixtures";

export default async function setup() {
    await migrator(db).implode({ dryRun: false, output: false });
}
