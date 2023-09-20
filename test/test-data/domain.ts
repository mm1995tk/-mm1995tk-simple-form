import { UserForm, UserFormValidatorMap, ValidateUserForm } from './types';

export const emptyUser: UserForm = {
  name: '',
  age: '',
  note: '',
};

export const sampleUser: UserForm = {
  name: 'sample',
  age: '20',
  note: 'sample user!',
};

const createIsRequired = (key: keyof UserForm): ValidateUserForm => {
  return d =>
    !!d[key] || {
      variant: 'danger',
      name: 'required',
      properties: [key],
    };
};

export const isRequireds = {
  name: createIsRequired('name'),
  age: createIsRequired('age'),
} as const satisfies UserFormValidatorMap;

export const isAgeNumber: ValidateUserForm = ({ age }) => {
  const ageNumber = Number(age);

  return (
    !age ||
    (!isNaN(ageNumber) && ageNumber > 0) || {
      variant: 'danger',
      name: 'invalid-format',
      properties: ['age'],
    }
  );
};

export const isAgeValid: ValidateUserForm = ({ age }) => {
  const ageNumber = Number(age);
  return (
    isNaN(ageNumber) ||
    ageNumber < 200 || {
      variant: 'warning',
      name: 'too-old',
      properties: ['age'],
    }
  );
};
