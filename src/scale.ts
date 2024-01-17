import { scaleLinear } from "d3-scale";

export const createScale = (type: "linear", domain: number[], range: number[]) => {
  const scale = scaleLinear().domain(domain).range(range);
  return scale;
};
