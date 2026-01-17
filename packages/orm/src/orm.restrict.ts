import {
    NormalizedConfig,
    NormalizedModelDefinition,
    NormalizedRelationDefinition,
} from "@casekit/orm-config";
import { Config, ModelName } from "@casekit/orm-schema";

import { Connection } from "./connection.js";
import { Orm } from "./orm.js";
import { Middleware } from "./types/Middleware.js";
import { RestrictModels } from "./types/RestrictModels.js";

export const restrict = <
    const C extends Config,
    const Allowed extends [...ModelName<C["models"]>[]],
>(
    config: NormalizedConfig,
    allowed: string[],
    connection: Connection,
    middleware: Middleware[],
): Orm<RestrictModels<C, Allowed[number]>> => {
    if (connection.isTransaction()) {
        throw new Error("Cannot create restricted ORM in a transaction");
    }
    const lookup = new Set(allowed);
    const models = Object.keys(config.models).reduce((acc, name) => {
        if (lookup.has(name)) {
            return {
                ...acc,
                [name]: {
                    ...config.models[name],
                    relations: Object.keys(
                        config.models[name]!.relations,
                    ).reduce((acc, name) => {
                        const relation = config.models[name]!.relations[name]!;
                        if (!lookup.has(relation.model)) {
                            return {
                                ...acc,
                                get [name](): NormalizedRelationDefinition {
                                    throw new Error(
                                        `Relation "${name}" references model "${relation.model}" which is not permitted in this restricted ORM instance`,
                                    );
                                },
                            };
                        } else if (
                            relation.type === "N:N" &&
                            !lookup.has(relation.through.model)
                        ) {
                            return {
                                ...acc,
                                get [name](): NormalizedRelationDefinition {
                                    throw new Error(
                                        `Relation "${name}" references model "${relation.through.model}" which is not permitted in this restricted ORM instance`,
                                    );
                                },
                            };
                        } else {
                            return {
                                ...acc,
                                [name]: relation,
                            };
                        }
                    }, {}),
                },
            };
        } else {
            return {
                ...acc,
                get [name](): NormalizedModelDefinition {
                    throw new Error(
                        `Model ${name} is not permitted in this restricted ORM instance`,
                    );
                },
            };
        }
    }, {});

    return new Orm<RestrictModels<C, Allowed[number]>>(
        { ...config, models },
        connection,
        middleware,
    );
};
