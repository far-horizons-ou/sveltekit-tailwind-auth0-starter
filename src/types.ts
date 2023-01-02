declare global {
  interface BigInt {
    toJSON: () => number;
    fromJSON: () => bigint;
  }
}

// eslint-disable-next-line no-extend-native
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

// eslint-disable-next-line no-extend-native
BigInt.prototype.fromJSON = function () {
  return BigInt(this as any);
};

export type Maybe<T> = T | null;

// https://stackoverflow.com/a/57287046/65903
export type Falsy = false | 0 | '' | null | undefined;

// this is a type predicate - if x is `truthy`, then it's T
export const isTruthy = <T>(x: T | Falsy): x is T => !!x;

export type UncapitalizeKeys<T extends object> = Uncapitalize<keyof T & string>;

export type UncapitalizeObjectKeys<T extends object> = {
  [key in UncapitalizeKeys<T>]: Capitalize<key> extends keyof T
    ? T[Capitalize<key>]
    : never;
};

export const lowerCaseKeys = <T extends object>(
  obj: T,
): UncapitalizeObjectKeys<T> => {
  const entries = Object.entries(obj);
  const mappedEntries = entries.map(([k, v]) => [
    `${k.substr(0, 1).toLowerCase()}${k.substr(1)}`,
    v,
  ]);

  return Object.fromEntries(mappedEntries) as UncapitalizeObjectKeys<T>;
};
