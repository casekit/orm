export type BaseRelation =
    | {
          model: string;
          type: "N:N";
          foreignKey: string | string[];
          otherKey: string | string[];
          through: string;
      }
    | {
          model: string;
          type: "1:N" | "N:1";
          foreignKey: string | string[];
      };
