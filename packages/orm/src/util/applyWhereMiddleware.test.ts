import { beforeEach, describe, expect, test, vi } from "vitest";

import { NormalizedConfig } from "@casekit/orm-config";
import { ModelDefinitions, OperatorDefinitions } from "@casekit/orm-schema";

import { $eq } from "#operators.js";
import { createTestDB } from "../tests/util/db.js";
import { mockLogger } from "../tests/util/logger.js";
import { Middleware } from "../types/Middleware.js";
import { WhereClause } from "../types/WhereClause.js";
import { applyWhereMiddleware } from "./applyWhereMiddleware.js";

describe("applyWhereMiddleware", () => {
    const logger = mockLogger();
    let config: NormalizedConfig;

    beforeEach(() => {
        logger.clear();
        const { db } = createTestDB();
        config = db.config;
    });

    test("returns original where clause when no middleware exists", () => {
        const middleware: Middleware[] = [];
        const modelName = "user";
        const whereClause = { id: 1 } as WhereClause<
            ModelDefinitions,
            OperatorDefinitions,
            string
        >;

        const result = applyWhereMiddleware(
            config,
            middleware,
            modelName,
            whereClause,
        );
        expect(result).toBe(whereClause);
    });

    test("returns original where clause when middleware has no where function", () => {
        const middleware: Middleware[] = [{}];
        const modelName = "user";
        const whereClause = { id: 1 } as WhereClause<
            ModelDefinitions,
            OperatorDefinitions,
            string
        >;

        const result = applyWhereMiddleware(
            config,
            middleware,
            modelName,
            whereClause,
        );
        expect(result).toBe(whereClause);
    });

    test("applies a single middleware to the where clause", () => {
        const modelName = "user";
        const modifiedWhere = { id: 2 } as WhereClause<
            ModelDefinitions,
            OperatorDefinitions,
            string
        >;
        const whereMiddlewareFn = vi.fn().mockReturnValue(modifiedWhere);

        const middleware: Middleware[] = [
            {
                where: whereMiddlewareFn,
            },
        ];
        const originalWhere = { id: 1 } as WhereClause<
            ModelDefinitions,
            OperatorDefinitions,
            string
        >;

        const result = applyWhereMiddleware(
            config,
            middleware,
            modelName,
            originalWhere,
        );

        expect(whereMiddlewareFn).toHaveBeenCalledWith(
            config,
            modelName,
            originalWhere,
        );
        expect(result).toBe(modifiedWhere);
    });

    test("applies multiple middleware to the where clause in order", () => {
        const modelName = "user";
        const middleware1Result = { id: 2 } as WhereClause<
            ModelDefinitions,
            OperatorDefinitions,
            string
        >;
        const middleware2Result = { id: 3 } as WhereClause<
            ModelDefinitions,
            OperatorDefinitions,
            string
        >;

        const whereMiddlewareFn1 = vi.fn().mockReturnValue(middleware1Result);
        const whereMiddlewareFn2 = vi.fn().mockReturnValue(middleware2Result);

        const middleware: Middleware[] = [
            {
                where: whereMiddlewareFn1,
            },
            {
                where: whereMiddlewareFn2,
            },
        ];

        const originalWhere = { id: 1 } as WhereClause<
            ModelDefinitions,
            OperatorDefinitions,
            string
        >;

        const result = applyWhereMiddleware(
            config,
            middleware,
            modelName,
            originalWhere,
        );

        expect(whereMiddlewareFn1).toHaveBeenCalledWith(
            config,
            modelName,
            originalWhere,
        );
        expect(whereMiddlewareFn2).toHaveBeenCalledWith(
            config,
            modelName,
            middleware1Result,
        );
        expect(result).toBe(middleware2Result);
    });

    test("applies complex where clause with operators", () => {
        const modelName = "user";
        const originalWhere = {
            name: { [$eq]: "John" },
        } as WhereClause<ModelDefinitions, OperatorDefinitions, string>;

        const modifiedWhere = {
            name: { [$eq]: "John" },
            active: true,
        } as WhereClause<ModelDefinitions, OperatorDefinitions, string>;

        const whereMiddlewareFn = vi
            .fn()
            .mockImplementation((config, model, where) => {
                return {
                    ...where,
                    active: true,
                };
            });

        const middleware: Middleware[] = [
            {
                where: whereMiddlewareFn,
            },
        ];

        const result = applyWhereMiddleware(
            config,
            middleware,
            modelName,
            originalWhere,
        );

        expect(whereMiddlewareFn).toHaveBeenCalledWith(
            config,
            modelName,
            originalWhere,
        );
        expect(result).toEqual(modifiedWhere);
    });
});
