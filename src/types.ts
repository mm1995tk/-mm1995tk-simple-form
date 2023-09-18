import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';

export type ValueOrFunc<T extends FieldValues, Path extends FieldPath<T>> = Value<T, Path> | Func<T, Path>;

export type DirtyFieldMap<T extends Record<string, unknown>> = { [key in keyof T]: boolean };

export type Labeled<T> = {
  id: string;
  data: T;
};

type Value<T extends FieldValues, Path extends FieldPath<T>> = FieldPathValue<T, Path>;
export type Func<T extends FieldValues, Path extends FieldPath<T>> = (
  item: FieldPathValue<T, Path>,
  origin: () => T
) => FieldPathValue<T, Path>;

export type Infer<Tuple extends readonly [string, ...string[]]> = [...Tuple][number];
