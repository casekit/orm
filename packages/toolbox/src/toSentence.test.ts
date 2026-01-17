import { expect, test } from "vitest";

import { toSentence } from "./toSentence.js";

test("toSentence returns empty string for empty array", () => {
    expect(toSentence([])).toBe("");
});

test("toSentence returns single item for array of one", () => {
    expect(toSentence(["one"])).toBe("one");
});

test("toSentence joins two items with conjunction", () => {
    expect(toSentence(["one", "two"])).toBe("one and two");
});

test("toSentence joins multiple items with commas and conjunction", () => {
    expect(toSentence(["one", "two", "three"])).toBe("one, two, and three");
    expect(toSentence(["one", "two", "three", "four"])).toBe(
        "one, two, three, and four",
    );
});

test("toSentence uses custom conjunction", () => {
    expect(toSentence(["one", "two"], "or")).toBe("one or two");
    expect(toSentence(["one", "two", "three"], "or")).toBe(
        "one, two, or three",
    );
});

test("toSentence works with Set", () => {
    expect(toSentence(new Set(["one", "two", "three"]))).toBe(
        "one, two, and three",
    );
});
