// typescript-eslint can't run against TypeScript 7, which doesn't ship a
// programmatic API yet. TypeScript publishes the 6.0 API as
// @typescript/typescript6 so the two can run side by side: give the
// typescript-eslint packages that instead of the workspace's TypeScript 7.
// Remove this once typescript-eslint supports TypeScript 7
// (https://github.com/typescript-eslint/typescript-eslint/issues/10940).
const typescript6 = "npm:@typescript/typescript6@^6.0.2";

const needsTypescript6 = (name) =>
    name === "typescript-eslint" ||
    name === "ts-api-utils" ||
    name.startsWith("@typescript-eslint/");

module.exports = {
    hooks: {
        readPackage(pkg) {
            if (needsTypescript6(pkg.name) && pkg.peerDependencies?.typescript) {
                delete pkg.peerDependencies.typescript;
                pkg.dependencies = { ...pkg.dependencies, typescript: typescript6 };
            }
            return pkg;
        },
    },
};
