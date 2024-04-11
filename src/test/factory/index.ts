import { generateMock } from "@anatine/zod-mock";
import { mapValues } from "lodash-es";
import { z } from "zod";

import { Orm } from "../../orm";
import { BaseModel } from "../../schema/types/base/BaseModel";
import { ModelDefinitions } from "../../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../schema/types/definitions/RelationsDefinitions";
import { ModelName } from "../../schema/types/helpers/ModelName";
import { ModelType } from "../../schema/types/helpers/ModelType";
import { db } from "../db";

export const makeFactory = <
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
>(
    db: Orm<Models, Relations>,
    m: M,
) => {
    const model = db.config.models[m] as BaseModel;
    const zodSchema = z.object(
        mapValues(model.columns, (c) =>
            c.nullable ? c.zodSchema.optional() : c.zodSchema,
        ),
    );
    return (data: Partial<ModelType<Models, M>>) => ({
        ...generateMock(zodSchema),
        ...data,
    });
};

const user = makeFactory(db, "user");
const post = makeFactory(db, "post");
const tenant = makeFactory(db, "tenant");
const tenantUser = makeFactory(db, "tenantUser");

export const factory = {
    user,
    post,
    tenant,
    tenantUser,
};
