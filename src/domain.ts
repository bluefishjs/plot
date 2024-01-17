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
  const merged = domains.reduce((acc, domain) => [...acc, ...domain], []);
  return [Math.min(...merged), Math.max(...merged)];
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
