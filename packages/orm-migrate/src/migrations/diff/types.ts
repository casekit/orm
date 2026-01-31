import type {
    ColumnSnapshot,
    ForeignKeySnapshot,
    TableSnapshot,
    UniqueConstraintSnapshot,
} from "../types.js";

export interface ColumnChanges {
    type?: { from: string; to: string };
    nullable?: { from: boolean; to: boolean };
    default?: { from: string | null; to: string | null };
}

export type SchemaDiffOperation =
    | { type: "createSchema"; schema: string }
    | { type: "dropSchema"; schema: string }
    | { type: "createExtension"; name: string; schema: string }
    | { type: "dropExtension"; name: string; schema: string }
    | { type: "createTable"; table: TableSnapshot }
    | { type: "dropTable"; schema: string; table: string }
    | {
          type: "addColumn";
          schema: string;
          table: string;
          column: ColumnSnapshot;
      }
    | { type: "dropColumn"; schema: string; table: string; column: string }
    | {
          type: "renameColumn";
          schema: string;
          table: string;
          oldName: string;
          newName: string;
      }
    | {
          type: "alterColumn";
          schema: string;
          table: string;
          column: string;
          changes: ColumnChanges;
      }
    | {
          type: "addForeignKey";
          schema: string;
          table: string;
          foreignKey: ForeignKeySnapshot;
      }
    | {
          type: "dropForeignKey";
          schema: string;
          table: string;
          constraintName: string;
      }
    | {
          type: "addUniqueConstraint";
          schema: string;
          table: string;
          constraint: UniqueConstraintSnapshot;
      }
    | {
          type: "dropUniqueConstraint";
          schema: string;
          table: string;
          constraintName: string;
      }
    | {
          type: "renameForeignKey";
          schema: string;
          table: string;
          oldName: string;
          newName: string;
      }
    | {
          type: "renameUniqueConstraint";
          schema: string;
          table: string;
          oldName: string;
          newName: string;
      }
    | {
          type: "alterPrimaryKey";
          schema: string;
          table: string;
          oldConstraintName: string | null;
          oldColumns: string[];
          newColumns: string[];
      };
