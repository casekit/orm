import { type ModelDefinition, sql } from "@casekit/orm";

export const book = {
	fields: {
		id: {
			type: "serial",
			primaryKey: true,
		},
		title: {
			type: "text",
		},
		authorId: {
			type: "integer",
			references: {
				model: "author",
				field: "id",
			},
		},
		createdAt: {
			type: "timestamp",
			default: sql`now()`,
		},
	},
	relations: {
		author: {
			type: "N:1",
			model: "author",
			fromField: "authorId",
			toField: "id",
		},
	},
} as const satisfies ModelDefinition;
