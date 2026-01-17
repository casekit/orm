import * as prettier from "prettier";

export const prettify = async (path: string, content: string) => {
    const prettierOptions = await prettier.resolveConfig(path);
    return await prettier.format(content, {
        ...prettierOptions,
        parser: "typescript",
    });
};
