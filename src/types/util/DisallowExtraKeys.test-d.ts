import { assertType, describe, test } from "vitest";

import { DisallowExtraKeys } from "./DisallowExtraKeys";

type Foo = { x: string; y: number };

describe("DisallowExtraKeys", () => {
    test("it enforces that extra properties cannot be passed as part of a generic", () => {
        const f1 = <T extends Foo>(foo: T) => foo;
        // without it, no type error is raised here - extra properties are allowed
        assertType(f1({ x: "3", y: 3, z: "three" }));

        const f2 = <T extends Foo>(foo: DisallowExtraKeys<Foo, T>) => foo;
        // with it, a type error is raised
        // @ts-expect-error name is a string
        assertType(f2({ x: "3", y: 3, z: "three" }));
    });
});
