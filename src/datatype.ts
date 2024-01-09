export type DataType =
  | {
      kind: "continuous";
      zero?: boolean;
    }
  | {
      kind: "discrete";
      ordered?: boolean;
    };

export const continuous = ({ zero }: { zero?: boolean } = {}): DataType => ({
  kind: "continuous",
  zero,
});

export const discrete = ({ ordered }: { ordered?: boolean } = {}): DataType => ({
  kind: "discrete",
  ordered,
});
