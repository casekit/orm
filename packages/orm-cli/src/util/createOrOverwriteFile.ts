import { confirm } from "@inquirer/prompts";
import fs from "fs";
import path from "path";

export const createOrOverwriteFile = async (
    filePath: string,
    content: string,
    force?: boolean,
) => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath) && !force) {
        const overwrite = await confirm({
            message: `${filePath} already exists - overwrite it?`,
            default: false,
        });
        if (!overwrite) return;
    }
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
    return fullPath;
};
