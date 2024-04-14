import { ValuesMiddleware } from "./ValuesMiddleware";
import { WhereMiddleware } from "./WhereMiddleware";

export type Middleware = {
    find?: {
        where?: WhereMiddleware;
    };
    create?: {
        values?: ValuesMiddleware;
    };
    update?: {
        set?: ValuesMiddleware;
        where?: WhereMiddleware;
    };
    delete?: {
        where?: WhereMiddleware;
    };
    where?: WhereMiddleware;
    values?: ValuesMiddleware;
};
