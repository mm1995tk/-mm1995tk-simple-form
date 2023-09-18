'use client';
import { createSimpleForm } from '@/lib/simple-form';
import { addORCondition, type AddORCondition } from '@mm1995tk/simple-form';

import { emptyUser, isAgeNumber, isRequireds, isAgeValid } from './domain';
import { UserFormAlertDef, UserForm } from './types';

export const { useSimpleForm, useHydrateForm, useControlledAlert } = createSimpleForm(emptyUser);

export const useAlert = () => {
  const [, { isDirty }] = useSimpleForm();

  const isAgeNotDirtyOr = addORConditionToUserFormValidator(!isDirty('age'));
  const isNameNotDirtyOr = addORConditionToUserFormValidator(!isDirty('name'));

  const alert = useControlledAlert<UserFormAlertDef>(
    isNameNotDirtyOr(isRequireds.name),
    isAgeNotDirtyOr(isRequireds.age),
    isAgeNotDirtyOr(isAgeNumber),
    isAgeValid
  );

  return alert(console.log);
};
const addORConditionToUserFormValidator: AddORCondition<UserForm, UserFormAlertDef> = addORCondition;
