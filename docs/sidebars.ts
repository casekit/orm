import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
    docsSidebar: [
        "index",
        "getting-started",
        {
            type: "category",
            label: "Guide",
            collapsed: false,
            items: [
                "guide/defining-models",
                "guide/querying",
                "guide/relations",
                "guide/mutations",
                "guide/transactions",
                "guide/middleware",
                "guide/raw-sql",
            ],
        },
        {
            type: "category",
            label: "API Reference",
            collapsed: true,
            items: [
                "api/overview",
                "api/configuration",
                "api/operators",
                "api/types",
            ],
        },
        {
            type: "category",
            label: "CLI",
            collapsed: true,
            items: ["cli/commands", "cli/configuration"],
        },
    ],
};

export default sidebars;
