import type { FieldPath, FieldValues } from 'react-hook-form';
import type { Func, Labeled, ValueOrFunc } from './types';
import { ulid } from 'ulidx';

export const isFunc = <T extends FieldValues, Path extends FieldPath<T>>(
  valueOrFunc: ValueOrFunc<T, Path>
): valueOrFunc is Func<T, Path> => typeof valueOrFunc === 'function';

export const label = <T>(data: T): Labeled<T> => {
  return { id: ulid(), data };
};

/** オブジェクトの一階層目のプロパティを比較して差分を検出する */
export const detectDiffByProps = <T extends Record<string, unknown>>(a: T) => {
  return (b: T): { [k in keyof T]: boolean } => {
    return Object.fromEntries(
      Object.keys(a).map((key: keyof T) => {
        return [key, JSON.stringify(a[key]) !== JSON.stringify(b[key])];
      }) satisfies [keyof T, boolean][]
    ) as { [k in keyof T]: boolean };
  };
};


if (import.meta.vitest) {
  const { expect, test, describe } = import.meta.vitest;

  describe('detectDiffByProps test', () => {
    test('no-diff', () => {
      const r = detectDiffByProps({ a: 1, b: 2 })({ a: 1, b: 2 });
      expect(r).toEqual({ a: false, b: false });
    });
    test('diff', () => {
      const r = detectDiffByProps({ a: 1, b: 2 })({ a: 1, b: 3 });
      expect(r).toEqual({ a: false, b: true });
    });
    test('no-diff-nest', () => {
      const r = detectDiffByProps({ a: 1, b: 2, c: { x: 1, y: 2 } })({ a: 1, b: 2, c: { x: 1, y: 2 } });
      expect(r).toEqual({ a: false, b: false, c: false });
    });

    test('diff-nest', () => {
      const r = detectDiffByProps({ a: 1, b: 2, c: { x: 1, y: 8 } })({ a: 1, b: 2, c: { x: 1, y: 2 } });
      expect(r).toEqual({ a: false, b: false, c: true });
    });
  });
}
