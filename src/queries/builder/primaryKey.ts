import { Model } from "~/types/schema";

export const primaryKey = (model: Model) =>
    Object.entries(model.columns)
        .filter(([_, column]) => column.primaryKey)
        .map(([name]) => name);
