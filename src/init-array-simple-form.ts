import { AlertReport, Validators, createValidationDefiner } from '@mm1995tk/declarative-validator';
import { RecordUpdater, generateRecordUpdater } from '@mm1995tk/immutable-record-updater';
import { FieldPath } from 'react-hook-form';
import { atom, useAtom, useAtomValue, useSetAtom, useStore, type PrimitiveAtom, type WritableAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { ulid } from 'ulidx';
import { detectDiffByProps, isFunc, label } from './lib';
import type { DirtyFieldMap, Labeled, ValueOrFunc } from './types';

type Atoms<T extends Record<string, unknown>> = {
  dataAtom: PrimitiveAtom<Labeled<T>[]>;
  initialStateAtom: PrimitiveAtom<Labeled<T>[]>;
  setterAtom: WritableAtom<null, [newValue: RecordUpdater<WrapedForUpdater<T>, Error, never>], void>;
  dirtyFieldMapAtom: PrimitiveAtom<Map<string, DirtyFieldMap<T>>>;
};

export const initArraySimpleForm = <Variant extends string>(...variants: Variant[]) => {
  return <T extends Record<string, unknown>>(empty: T) => {
    const dataUpdater = generateRecordUpdater<WrapedForUpdater<T>>();
    const dataAtom = atom<Labeled<T>[]>([]);

    const defaultDirtyMap = () =>
      Object.fromEntries(Object.entries(empty).map(([k]) => [k, false])) as DirtyFieldMap<T>;

    const atoms = {
      dataAtom,
      dirtyFieldMapAtom: atom<Map<string, DirtyFieldMap<T>>>(new Map()),
      initialStateAtom: atom<Labeled<T>[]>([]),
      setterAtom: atom(null, (_, set, newValue: RecordUpdater<WrapedForUpdater<T>, Error, never>) => {
        set(dataAtom, pre => newValue.runUnsafe({ items: pre }).items);
      }),
    };

    return {
      useHydrateArrayForm: createHydration({
        defaultDirtyMap,
        ...atoms,
      }),
      useArraySimpleForm: createArraySimpleFormHook(atoms, empty, dataUpdater),
      useControlledAlert: createAlertHook(atoms, variants),
    };
  };
};

const createArraySimpleFormHook = <T extends Record<string, unknown>>(
  { dataAtom, dirtyFieldMapAtom, initialStateAtom, setterAtom }: Atoms<T>,
  empty: T,
  dataUpdater: RecordUpdater<WrapedForUpdater<T>, Error, never>
) => {
  return () => {
    const [data, setData] = useAtom(dataAtom);
    const [dirtyFieldMap, setDirtyMap] = useAtom(dirtyFieldMapAtom);
    const initialValue = useAtomValue(initialStateAtom);

    const _mutateData = useSetAtom(setterAtom);

    const replace = (items: T[]) => {
      setData(items.map(label));
    };

    const replacePerfomance = (items: Labeled<T>[]) => {
      setData(items);
    };

    return [
      data,
      {
        replace,
        replacePerfomance,

        push: (...items: T[]) => {
          setData(d => d.concat(items.map(label)));
        },

        addEmpty: () => {
          setData(d => d.concat(label(empty)));
        },

        remove: () => {
          setData(() => []);
        },
        reset: () => {
          setData(() => initialValue);
        },
        handleEachForm(index: number) {
          const unitOfData = data.at(index);

          if (!unitOfData) {
            throw new Error(`access data[${index}], but the length of data is ${data.length}`);
          }

          const sameIdinitialState = initialValue.find(item => item.id === unitOfData.id) || {
            id: unitOfData.id,
            data: empty,
          };

          const detectDiffByPropsToCurrent = detectDiffByProps(unitOfData.data);

          const dMap = dirtyFieldMap.get(sameIdinitialState.id)!;

          const mutate = <P extends FieldPath<T>>(path: P, _valueOrFunc: ValueOrFunc<T, P>) => {
            const valueOrFunc = _valueOrFunc as ValueOrFunc<WrapedForUpdater<T>, FieldPath<WrapedForUpdater<T>>>;
            const nextUpdater = dataUpdater.set(
              `items.${index}.data.${path}` as FieldPath<WrapedForUpdater<T>>,
              (value, getPreState) => {
                const preState = getPreState();
                if (!preState.success) {
                  throw new Error(JSON.stringify(preState.errors));
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return isFunc(valueOrFunc) ? (valueOrFunc as any)(value, () => preState.data) : valueOrFunc;
              }
            );

            const diffMap = detectDiffByPropsToCurrent(nextUpdater.runUnsafe({ items: data }).items[index].data);
            const keys: (keyof T)[] = Object.keys(diffMap);

            const newDMap = { ...dMap };

            keys.forEach(key => {
              newDMap[key] = newDMap[key] || diffMap[key];
              const newM = new Map(dirtyFieldMap);
              newM.set(sameIdinitialState.id, newDMap);
              setDirtyMap(newM);
            });

            _mutateData(nextUpdater);
          };
          return {
            mutate,

            remove: () => {
              setData(arr => arr.filter((_, i) => i !== index));
            },

            dMap,

            isDirty(key?: keyof T) {
              if (key) {
                return dMap[key];
              }
              return Object.values(dMap).some(Boolean);
            },

            reset: (key?: keyof T) => {
              if (key) {
                setData(arr =>
                  arr.map((item, i) =>
                    i === index
                      ? {
                          id: sameIdinitialState.id,
                          data: { ...item.data, [key]: sameIdinitialState.data[key] },
                        }
                      : item
                  )
                );
                return;
              }

              setData(arr => arr.map((item, i) => (i === index ? sameIdinitialState : item)));
            },
          };
        },
      },
    ] as const;
  };
};

const createAlertHook = <T extends Record<string, unknown>, Variant extends string>(
  { dataAtom }: Atoms<T>,
  variants: Variant[]
) => {
  const defineValidator = createValidationDefiner<Variant>(...variants);

  return function useControlledAlert<AlertDef extends { [k in Variant]: string }>(
    ...validators: Validators<T, Pick<AlertDef, Variant>>
  ) {
    const values = useAtomValue(dataAtom);
    const validate = defineValidator(...validators);

    return values.map(run);

    function run({ data }: Labeled<T>) {
      type OnAlertDetected = (item: AlertReport<T, Pick<AlertDef, Variant>>) => void;
      return (onAlertDetected?: OnAlertDetected) => validate(data, onAlertDetected);
    }
  };
};

const createHydration = <T extends Record<string, unknown>>({
  defaultDirtyMap,
  dataAtom,
  initialStateAtom,
  dirtyFieldMapAtom,
}: {
  defaultDirtyMap: () => DirtyFieldMap<T>;
  dataAtom: PrimitiveAtom<Labeled<T>[]>;
  initialStateAtom: PrimitiveAtom<Labeled<T>[]>;
  dirtyFieldMapAtom: PrimitiveAtom<Map<string, DirtyFieldMap<T>>>;
}) => {
  return (initialValue: T[] = []) => {
    const data: Labeled<T>[] = [];
    const ini: Labeled<T>[] = [];
    const map = new Map<string, DirtyFieldMap<T>>();
    for (let i = 0; i < initialValue.length; i++) {
      const item: Labeled<T> = { id: ulid(), data: initialValue[i] };
      data.push(item);
      ini.push(item);
      map.set(item.id, defaultDirtyMap());
    }

    useHydrateAtoms(
      [
        [dataAtom, data],
        [initialStateAtom, ini],
        [dirtyFieldMapAtom, map],
      ],
      { store: useStore() }
    );
  };
};

type WrapedForUpdater<T> = { items: Labeled<T>[] };
