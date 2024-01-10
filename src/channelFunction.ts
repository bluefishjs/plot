import { Scale } from "./plot";

export type Literal = string | number | symbol;

export type Field<T> = keyof T;

export type Fn<T> = (data: T) => any;

export type Encoding<T> = Field<T> | Fn<T> | Literal;

// if the input is a constant, then treat it as an aesthetic value
// otherwise, it will be scaled
export const createChannelFunction = <T>(input: Encoding<T> | undefined, scale: Scale, defaultValue?: any): Fn<T> => {
  // no input
  if (input === undefined) {
    return () => defaultValue;
    // input might be a field
  } else if (typeof input === "string" || typeof input === "number" || typeof input === "symbol") {
    return (data: any) => (input in data ? scale(data[input]) : input);
    // input is a function
  } else {
    return (data: any) => scale(input(data));
  }
};
