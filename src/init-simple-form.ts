import { AlertReport, Validators, createValidationDefiner } from '@mm1995tk/declarative-validator';
import { RecordUpdater, generateRecordUpdater } from '@mm1995tk/immutable-record-updater';
import { type PrimitiveAtom, type WritableAtom, atom, useAtom, useAtomValue, useSetAtom, useStore } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { detectDiffByProps, isFunc } from './lib';
import type { DirtyFieldMap, ValueOrFunc } from './types';
import { FieldPath } from 'react-hook-form';

export const initSimpleForm = <Variant extends string>(...variants: Variant[]) => {
  return <T extends Record<string, unknown>>(empty: T) => {
    const atoms = createAtoms(empty);

    return {
      useSimpleForm: createSimpleForm<T>({ ...atoms, empty, dataUpdater: generateRecordUpdater<T>() }),
      useControlledAlert: createAlertHook<T, Variant>({ dataAtom: atoms.dataAtom, variants }),
      useHydrateForm: createHydration(atoms),
    };
  };
};

const createAtoms = <T extends Record<string, unknown>>(empty: T) => {
  const dataAtom = atom(empty);
  const defaultDirtyMap = () => Object.fromEntries(Object.entries(empty).map(([k]) => [k, false])) as DirtyFieldMap<T>;

  return {
    dataAtom,
    initialDataAtom: atom(empty),
    setterAtom: atom(null, (_, set, newValue: RecordUpdater<T, Error, never>) => {
      set(dataAtom, newValue.runUnsafe);
    }),
    dirtyFieldMapAtom: atom<DirtyFieldMap<T>>(defaultDirtyMap()),
  };
};

const createSimpleForm = <T extends Record<string, unknown>>({
  dataAtom,
  empty,
  dirtyFieldMapAtom,
  dataUpdater,
  setterAtom,
  initialDataAtom,
}: {
  dataAtom: PrimitiveAtom<T>;
  empty: T;
  dirtyFieldMapAtom: PrimitiveAtom<DirtyFieldMap<T>>;
  dataUpdater: RecordUpdater<T, Error, never>;
  setterAtom: WritableAtom<null, [newValue: RecordUpdater<T, Error, never>], void>;
  initialDataAtom: PrimitiveAtom<T>;
}) => {
  return function useHook() {
    const [data, setData] = useAtom(dataAtom);
    const [dirtyFieldMap, setDirtyMap] = useAtom(dirtyFieldMapAtom);
    const initialValue = useAtomValue(initialDataAtom);

    const detectDiffByPropsToCurrentData = detectDiffByProps<T>(data);
    const mutateData = useMutation();

    return [
      data,
      {
        initialValue,

        /** useSimpleForm の引数で受け取った値をセットする */
        reset: (key?: keyof T): void => {
          if (!initialValue) {
            return;
          }
          if (!key) {
            return setData(() => initialValue);
          }
          setData(data => ({ ...data, [key]: initialValue[key] }));
        },

        /** createControlledForm の第１引数で受け取った値をセットする */
        empty: () => setData(() => empty),

        /** 受け取った値をセットする */
        replace: (item: T) => setData(() => item),

        /**
         * 指定したプロパティがdirtyであれば `true` を返す。
         * 指定がないとき、プロパティが少なくとも１つdirtyであれば `true` を返す。
         */
        isDirty: (k?: keyof T): boolean => (k ? dirtyFieldMap[k] : Object.values(dirtyFieldMap).some(Boolean)),

        /** プロパティを指定してデータを更新する */
        mutateData,
      },
    ] as const;

    function useMutation() {
      const mutateData = useSetAtom(setterAtom);

      return <P extends FieldPath<T>>(path: P, valueOrFunc: ValueOrFunc<T, P>) => {
        const nextUpdater = dataUpdater.set(path, (value, getPreState) => {
          const preState = getPreState();
          if (!preState.success) {
            throw new Error(JSON.stringify(preState.errors));
          }
          return isFunc(valueOrFunc) ? valueOrFunc(value, () => preState.data) : valueOrFunc;
        });

        const diffMap = detectDiffByPropsToCurrentData(nextUpdater.runUnsafe(data));
        const keys: (keyof T)[] = Object.keys(diffMap);

        const newDMap: DirtyFieldMap<T> = { ...dirtyFieldMap };
        keys.forEach(key => {
          newDMap[key] = newDMap[key] || diffMap[key];
        });
        setDirtyMap(newDMap);

        mutateData(nextUpdater);
      };
    }
  };
};

const createAlertHook = <T extends Record<string, unknown>, Variant extends string>({
  dataAtom,
  variants,
}: {
  dataAtom: PrimitiveAtom<T>;
  variants: Variant[];
}) => {
  const defineValidator = createValidationDefiner<Variant>(...variants);

  return function useHook<AlertDef extends { [k in Variant]: string }>(
    ...validators: Validators<T, Pick<AlertDef, Variant>>
  ) {
    const data = useAtomValue(dataAtom);
    const validate = defineValidator(...validators);

    return (onAlertDetected?: (item: AlertReport<T, Pick<AlertDef, Variant>>) => void) =>
      validate(data, onAlertDetected);
  };
};

const createHydration = <T extends Record<string, unknown>>({
  dataAtom,
  initialDataAtom,
}: {
  dataAtom: PrimitiveAtom<T>;
  initialDataAtom: PrimitiveAtom<T>;
}) => {
  return function useHydrateForm(initialValue?: T) {
    useHydrateAtoms(
      [
        ...(initialValue
          ? ([
              [dataAtom, initialValue],
              [initialDataAtom, initialValue],
            ] as const)
          : []),
      ],
      { store: useStore() }
    );
  };
};
