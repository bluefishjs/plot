export type Discrete = any;
export type Continuous = [number, number];

export type Domain = Discrete | Continuous;

export const discreteOrContinuous = (datum: any): "discrete" | "continuous" => {
  if (typeof datum === "number") {
    return "continuous";
  } else {
    return "discrete";
  }
};

export const mergeContinuousDomains = (domains: number[][]) => {
  const min = Math.min(...domains.map((d) => d[0]));
  const max = Math.max(...domains.map((d) => d[1]));
  return [min, max];
};

export const computeDomain = (data: any[], dataFn: (d: any) => any) => {
  const mappedData = data.map(dataFn).filter((d) => d !== undefined);

  switch (discreteOrContinuous(dataFn(data[0]))) {
    case "discrete":
      return [...new Set(mappedData)];
    case "continuous":
      return [Math.min(...mappedData), Math.max(...mappedData)];
  }
};
