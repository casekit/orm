import prettier from "prettier";

export const format = async (source: string) => {
    return await prettier.format(source, {
        parser: "typescript",
        printWidth: 80,
        tabWidth: 4,
        trailingComma: "all",
        singleQuote: false,
        semi: true,
    });
};
