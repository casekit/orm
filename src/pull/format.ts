import prettier from "prettier";

export const format = async (source: string) => {
    const filePath = await prettier.resolveConfigFile();
    return await prettier.format(
        source,
        filePath
            ? { filePath }
            : {
                  parser: "typescript",
                  printWidth: 80,
                  tabWidth: 4,
                  trailingComma: "all",
                  singleQuote: false,
                  semi: true,
              },
    );
};
