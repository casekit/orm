import { faker } from "@faker-js/faker";
import z, { ZodObject, ZodType } from "zod";
import { $ZodType } from "zod/v4/core";

const generateInner = <T>(schema: $ZodType<T>): unknown => {
    if (schema instanceof ZodObject) {
        const shape = schema.shape;
        const result: Record<string, unknown> = {};
        for (const key in shape) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            result[key] = generateInner(shape[key]);
        }
        return result as T;
    } else if (schema instanceof z.ZodOptional) {
        return generateInner(schema.def.innerType);
    } else if (schema instanceof z.ZodRecord) {
        return {
            a: generateInner(schema.valueType),
            b: generateInner(schema.valueType),
            c: generateInner(schema.valueType),
        };
    } else if (schema instanceof z.ZodEnum) {
        return faker.helpers.arrayElement(Object.values(schema.def.entries));
    } else if (schema instanceof z.ZodArray) {
        return faker.helpers.multiple(() => generateInner(schema.element), {
            count: { min: 1, max: 3 },
        });
    } else if (schema instanceof z.ZodDate) {
        return faker.date.past();
    } else if (schema instanceof z.ZodBoolean) {
        return faker.datatype.boolean();
    } else if (schema instanceof z.ZodUUID) {
        return faker.string.uuid();
    } else if (schema instanceof z.ZodString) {
        return faker.lorem.word();
    } else if (schema instanceof z.ZodEmail) {
        return faker.internet.exampleEmail();
    } else if (schema instanceof z.ZodBigInt) {
        return faker.number.int({ min: 1, max: 100 });
    } else if (schema instanceof z.ZodNumber) {
        return faker.number.int({ min: 1, max: 100 });
    } else {
        return undefined;
    }
};

export const generate = <T>(schema: ZodType<T>, overrides?: Partial<T>): T => {
    return { ...(generateInner(schema) as T), ...overrides };
};
