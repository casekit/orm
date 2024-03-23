export const parseCreateUniqueIndexStatement = (
    command: string,
): { columns: string[]; where?: string } => {
    const columnsMatch = command.match(/ON[^(]*\(([^)]*)\)/);
    if (!columnsMatch || !columnsMatch[1])
        throw new Error("Unable to parse unique index statement: " + command);

    const columns = columnsMatch[1].split(", ");

    const whereMatch = command.match(/WHERE[^(]*\(([^)]*)\)/);

    return {
        columns,
        where: whereMatch ? whereMatch[1] : undefined,
    };
};
