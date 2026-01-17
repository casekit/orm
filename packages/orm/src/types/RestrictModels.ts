import {
    Config,
    ModelDefinitions,
    ModelName,
    RelationDefinitions,
} from "@casekit/orm-schema";

export type RestrictRelation<
    Relations extends RelationDefinitions,
    R extends keyof Relations,
    Allowed extends string,
> = Relations[R] extends {
    type: "N:N";
}
    ? // N:N relations are excluded unless both the related and through model are allowed
      Relations[R] extends { model: Allowed; through: { model: Allowed } }
        ? R
        : never
    : // N:1 and 1:N relations are excluded unless the related model is allowed
      Relations[R] extends { model: Allowed }
      ? R
      : never;

export type RestrictModel<
    Models extends ModelDefinitions,
    Allowed extends ModelName<Models>,
    M extends ModelName<Models>,
> = Omit<Models[M], "relations"> & {
    relations: Models[M]["relations"] extends infer Relations extends
        RelationDefinitions
        ? keyof {
              [R in keyof Relations as RestrictRelation<
                  Relations,
                  R,
                  Allowed
              >]: Relations[R];
          } extends never
            ? undefined
            : {
                  [R in keyof Relations as RestrictRelation<
                      Relations,
                      R,
                      Allowed
                  >]: Relations[R];
              }
        : undefined;
};

export type RestrictModels<
    C extends Config,
    Allowed extends ModelName<C["models"]>,
    Models extends ModelDefinitions = C["models"],
> = Omit<C, "models"> & {
    models: { [M in Allowed]: RestrictModel<Models, Allowed, M> };
};
