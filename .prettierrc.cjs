module.exports = {
    printWidth: 80,
    tabWidth: 4,
    trailingComma: "all",
    singleQuote: false,
    semi: true,
    importOrder: ["^@casekit/(.*)$", "^[^.](.*)$", "^[./]"],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
    plugins: ["@trivago/prettier-plugin-sort-imports"],
};
