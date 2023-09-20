import { Validate, ValidatorMap } from '../../src';

export type UserForm = {
  name: string;
  age: string;
  note: string;
};

export type UserFormAlertDef = {
  danger:
    | 'required' // 必須
    | 'invalid-format';
  warning: 'too-old';
  info: never;
};

/**
 * {@link Data} のバリデータ
 */
export type ValidateUserForm = Validate<UserForm, UserFormAlertDef>;

export type UserFormValidatorMap = ValidatorMap<UserForm, UserFormAlertDef>;
