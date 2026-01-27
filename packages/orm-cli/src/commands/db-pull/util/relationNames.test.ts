import { describe, expect, it } from "vitest";

import type { ForeignKey } from "@casekit/orm-migrate";

import {
    guessManyToOneRelationName,
    guessOneToManyRelationName,
} from "./relationNames.js";

describe("guessManyToOneRelationName", () => {
    const createForeignKey = (
        columnsFrom: string[],
        tableFrom: string,
        tableTo: string,
    ): ForeignKey => ({
        constraintName: "test_fk",
        schema: "public",
        tableFrom,
        tableTo,
        columnsFrom,
        columnsTo: ["id"],
        onUpdate: null,
        onDelete: null,
    });

    it("handles single column foreign keys", () => {
        expect(
            guessManyToOneRelationName(
                createForeignKey(["user_id"], "posts", "users"),
            ),
        ).toBe("user");
        expect(
            guessManyToOneRelationName(
                createForeignKey(["author_id"], "posts", "users"),
            ),
        ).toBe("author");
        expect(
            guessManyToOneRelationName(
                createForeignKey(["created_by_id"], "posts", "users"),
            ),
        ).toBe("createdBy");
    });

    it("handles foreign key columns without _id suffix", () => {
        expect(
            guessManyToOneRelationName(
                createForeignKey(["user"], "posts", "users"),
            ),
        ).toBe("user");
        expect(
            guessManyToOneRelationName(
                createForeignKey(["author"], "posts", "users"),
            ),
        ).toBe("author");
    });

    it("handles multi-column foreign keys", () => {
        expect(
            guessManyToOneRelationName(
                createForeignKey(["tenant_id", "user_id"], "posts", "users"),
            ),
        ).toBe("tenantUser");
        expect(
            guessManyToOneRelationName(
                createForeignKey(
                    ["org_id", "dept_id", "user_id"],
                    "posts",
                    "users",
                ),
            ),
        ).toBe("orgDeptUser");
    });

    it("converts snake_case to camelCase", () => {
        expect(
            guessManyToOneRelationName(
                createForeignKey(
                    ["parent_category_id"],
                    "categories",
                    "categories",
                ),
            ),
        ).toBe("parentCategory");
        expect(
            guessManyToOneRelationName(
                createForeignKey(
                    ["primary_contact_id"],
                    "accounts",
                    "contacts",
                ),
            ),
        ).toBe("primaryContact");
    });
});

describe("guessOneToManyRelationName", () => {
    const createForeignKey = (
        columnsFrom: string[],
        tableFrom: string,
        tableTo: string,
    ): ForeignKey => ({
        constraintName: "test_fk",
        schema: "public",
        tableFrom,
        tableTo,
        columnsFrom,
        columnsTo: ["id"],
        onUpdate: null,
        onDelete: null,
    });

    it("handles standard one-to-many relationships", () => {
        expect(
            guessOneToManyRelationName(
                createForeignKey(["user_id"], "posts", "users"),
            ),
        ).toBe("posts");
        expect(
            guessOneToManyRelationName(
                createForeignKey(["author_id"], "posts", "users"),
            ),
        ).toBe("authorPosts");
        expect(
            guessOneToManyRelationName(
                createForeignKey(["category_id"], "posts", "categories"),
            ),
        ).toBe("posts");
    });

    it("handles self-referential relationships", () => {
        expect(
            guessOneToManyRelationName(
                createForeignKey(["parent_id"], "categories", "categories"),
            ),
        ).toBe("parentCategories");
        expect(
            guessOneToManyRelationName(
                createForeignKey(["manager_id"], "users", "users"),
            ),
        ).toBe("managerUsers");
    });

    it("handles multi-column foreign keys", () => {
        expect(
            guessOneToManyRelationName(
                createForeignKey(["tenant_id", "user_id"], "posts", "users"),
            ),
        ).toBe("tenantUserPosts");
        expect(
            guessOneToManyRelationName(
                createForeignKey(
                    ["org_id", "dept_id"],
                    "employees",
                    "departments",
                ),
            ),
        ).toBe("orgDeptEmployees");
    });

    it("pluralizes table names correctly", () => {
        expect(
            guessOneToManyRelationName(
                createForeignKey(["user_id"], "comment", "users"),
            ),
        ).toBe("comments");
        expect(
            guessOneToManyRelationName(
                createForeignKey(["user_id"], "reply", "users"),
            ),
        ).toBe("replies");
        expect(
            guessOneToManyRelationName(
                createForeignKey(["user_id"], "child", "users"),
            ),
        ).toBe("children");
    });

    it("converts snake_case to camelCase and adds proper spacing", () => {
        expect(
            guessOneToManyRelationName(
                createForeignKey(["created_by_id"], "posts", "users"),
            ),
        ).toBe("createdByPosts");
        expect(
            guessOneToManyRelationName(
                createForeignKey(["assigned_to_id"], "tasks", "users"),
            ),
        ).toBe("assignedToTasks");
    });
});
