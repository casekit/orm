export const parseCreateUniqueIndexStatement = (
    command: string,
): { columns: string[]; where?: string; nullsNotDistinct: boolean } => {
    const columnsMatch = command.match(/ON[^(]*\(([^)]*)\)/);
    if (!columnsMatch || !columnsMatch[1])
        throw new Error("Unable to parse unique index statement: " + command);

    const columns = columnsMatch[1].split(", ");

    const whereMatch = command.match(/WHERE[^(]*\(([^)]*)\)/);

    const nullsNotDistinct = !!command.match(/NULLS NOT DISTINCT/);

    return {
        columns,
        where: whereMatch ? whereMatch[1] : undefined,
        nullsNotDistinct,
    };
};
