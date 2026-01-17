import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
    title: "@casekit/orm",
    tagline:
        "A type-safe, PostgreSQL-native ORM for TypeScript with deep relational querying",
    favicon: "img/favicon.ico",

    future: {
        v4: true,
    },

    url: "https://casekit.github.io",
    baseUrl: "/orm/",

    organizationName: "casekit",
    projectName: "orm",

    onBrokenLinks: "throw",

    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },

    presets: [
        [
            "classic",
            {
                docs: {
                    sidebarPath: "./sidebars.ts",
                    editUrl: "https://github.com/casekit/orm/tree/main/docs/",
                    routeBasePath: "/",
                },
                blog: false,
                theme: {
                    customCss: "./src/css/custom.css",
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        colorMode: {
            defaultMode: "dark",
            respectPrefersColorScheme: true,
        },
        navbar: {
            title: "@casekit/orm",
            items: [
                {
                    type: "docSidebar",
                    sidebarId: "docsSidebar",
                    position: "left",
                    label: "Docs",
                },
                {
                    href: "https://github.com/casekit/orm",
                    label: "GitHub",
                    position: "right",
                },
            ],
        },
        footer: {
            style: "dark",
            links: [
                {
                    title: "Docs",
                    items: [
                        {
                            label: "Getting Started",
                            to: "/getting-started",
                        },
                        {
                            label: "API Reference",
                            to: "/api/overview",
                        },
                    ],
                },
                {
                    title: "More",
                    items: [
                        {
                            label: "GitHub",
                            href: "https://github.com/casekit/orm",
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} CaseKit. Built with Docusaurus.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
            additionalLanguages: ["bash", "json"],
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
