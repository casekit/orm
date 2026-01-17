import { FieldName, ModelDefinitions, ModelName } from "@casekit/orm-schema";

// this is a bit of a messy type but I haven't been able to
// make it cleaner without hurting type performance
type OrderByField<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> =
    // the easy case - we're ordering by a field from the model
    | FieldName<Models[M]>
    // the harder case - we're ordering by a field from a joined N:1 relation.
    // in this case the type is of the form relationName.fieldName
    | {
          // don't really understand why we have to do Extract<..., string> here,
          // but we do
          [R in Extract<
              keyof Models[M]["relations"],
              string
          >]: Models[M]["relations"][R] extends {
              type: "N:1";
              model: infer M2 extends ModelName<Models>;
          }
              ? `${R}.${Extract<keyof Models[M2]["fields"], string>}`
              : never;
      }[Extract<keyof Models[M]["relations"], string>];

export type OrderByClause<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = Array<OrderByField<Models, M> | [OrderByField<Models, M>, "asc" | "desc"]>;
