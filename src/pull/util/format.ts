import prettier from "prettier";

export const format = async (source: string) => {
    try {
        return await prettier.format(source, {
            parser: "typescript",
            printWidth: 80,
            tabWidth: 4,
            trailingComma: "all",
            singleQuote: false,
            semi: true,
        });
    } catch (e) {
        console.error(e);
        return source;
    }
};
