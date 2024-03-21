import { fc } from "@fast-check/vitest";

export const sqldate = () =>
    fc.date({
        min: new Date("1970-01-01T00:00:00.000Z"),
        max: new Date("9999-01-01T00:00:00.000Z"),
        noInvalidDate: true,
    });
