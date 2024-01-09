export type Literal = string | number | symbol;

export type Field<T> = keyof T;

export type Fn<T> = (data: T) => any;

export type Encoding<T> = Field<T> | Fn<T> | Literal;

export const createChannelFunction = <T>(input?: Encoding<T>, defaultValue?: any): Fn<T> => {
  // no input
  if (input === undefined) {
    return () => defaultValue;
    // input might be a field
  } else if (typeof input === "string" || typeof input === "number" || typeof input === "symbol") {
    return (data: any) => (input in data ? data[input] : input);
    // input is a function
  } else {
    return input;
  }
};
