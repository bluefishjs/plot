import { scaleLinear } from "d3-scale";
export const mergeDomains = (domains: number[][]) => {
  const merged = domains.reduce((acc, domain) => [...acc, ...domain], []);
  return [Math.min(...merged), Math.max(...merged)];
};

export const createScale = (type: "linear", domain: number[], range: number[]) => {
  const scale = scaleLinear().domain(domain).range(range);
  return scale;
};
