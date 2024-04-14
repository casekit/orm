import { BaseConfiguration } from "../../schema/types/base/BaseConfiguration";
import { BaseOrm } from "../../schema/types/base/BaseOrm";
import { BaseDeleteParams } from "../delete/types/BaseDeleteParams";
import { BaseUpdateParams } from "../update/types/BaseUpdateParams";
import { ValuesMiddleware } from "./ValuesMiddleware";
import { WhereMiddleware } from "./WhereMiddleware";

export type Middleware = {
    where?: WhereMiddleware;
    values?: ValuesMiddleware;
    find?: {
        where?: WhereMiddleware;
    };
    create?: {
        values?: ValuesMiddleware;
    };
    update?: {
        values?: ValuesMiddleware;
        where?: WhereMiddleware;
    };
    count?: {
        where?: WhereMiddleware;
    };
    delete?: {
        where?: WhereMiddleware;
        deleteOne?: (
            params: BaseDeleteParams,
            meta: {
                config: BaseConfiguration;
                model: string;
                deleteOne: (
                    params: BaseDeleteParams,
                ) => ReturnType<BaseOrm["deleteOne"]>;
                updateOne: (
                    params: BaseUpdateParams,
                ) => ReturnType<BaseOrm["updateOne"]>;
            },
        ) => unknown;
        deleteMany?: (
            params: BaseDeleteParams,
            meta: {
                config: BaseConfiguration;
                model: string;
                deleteMany: (
                    params: BaseDeleteParams,
                ) => ReturnType<BaseOrm["deleteOne"]>;
                updateMany: (
                    params: BaseUpdateParams,
                ) => ReturnType<BaseOrm["updateOne"]>;
            },
        ) => unknown;
    };
};
