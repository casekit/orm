import { migrator } from "@casekit/orm";

import { db } from "~/test/fixtures";

export default async function setup() {
    await migrator(db).implode();
}
