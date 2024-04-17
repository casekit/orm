export type LooseRelationDefinition =
    | { model: string; type: "1:N"; foreignKey: string }
    | { model: string; type: "N:1"; foreignKey: string }
    | {
          model: string;
          type: "N:N";
          through: string;
          foreignKey: string;
          otherKey: string;
      };
