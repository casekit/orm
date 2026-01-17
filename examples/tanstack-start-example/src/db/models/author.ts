import { type ModelDefinition, sql } from "@casekit/orm";

export const author = {
	fields: {
		id: {
			type: "serial",
			primaryKey: true,
		},
		name: { type: "text" },
		createdAt: {
			type: "timestamp",
			default: sql`now()`,
		},
	},
	relations: {
		books: {
			type: "1:N",
			model: "book",
			fromField: "id",
			toField: "authorId",
		},
	},
} as const satisfies ModelDefinition;
