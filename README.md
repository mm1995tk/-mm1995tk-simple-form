# @mm1995tk/simple-form

Test codes will be added in the future.

## Installation

```sh
pnpm add @mm1995tk/simple-form @mm1995tk/immutable-record-updater jotai
```

## Get Started

### STEP.0
re-export "SimpleFormJotaiBound"

```ts
'use client';
export { SimpleFormJotaiBound } from '@mm1995tk/simple-form';
```

### STEP.1

Enclose the application root with "SimpleFormJotaiBound".

### STEP.2

init simple-form by passing validation variants

```ts
export const createSimpleForm = initSimpleForm('danger', 'warning', 'info');
```


### STEP.3

define form types, its empty data and rules. then, create hooks of simple-form by passing empty data.

```ts
export type UserForm = {
  name: string;
  age: number | null;
  note: string;
};

export const emptyUser: UserForm = {
  name: '',
  age: null,
  note: '',
};

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


export const { useSimpleForm, useHydrateForm, useControlledAlert } = createSimpleForm(emptyUser);
```

### STEP.4
setup validation.

```ts
export const useAlert = () => {
  const [, { isDirty }] = useSimpleForm();

  const isAgeNotDirtyOr = addORConditionToUserFormValidator(!isDirty('age'));

  const alert = useControlledAlert<UserFormAlertDef>(
    isAgeNotDirtyOr(isAgeNumber),
    isAgeValid
  );

  return alert(console.log);
};
const addORConditionToUserFormValidator: AddORCondition<UserForm, UserFormAlertDef> = addORCondition;
```


### STEP.5
create form component.
```tsx
export const UserFormComponent = ({ initialData }: { initialData: UserForm }) => {
  // feed initial-value to form
  useHydrateForm(initialData);

  const [data, { reset }] = useSimpleForm();

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        console.log(data);
      }}
      style={{ display: 'flex', gap: 8, flexDirection: 'column' }}
    >
      <FieldInput field='name' />
      <FieldInput field='age' />
      <FieldInput field='note' />

      <div>
        <button
          type='button'
          onClick={() => {
            reset();
          }}
        >
          reset all fields
        </button>
        {'  '}
        <button type='submit'>submit</button>
      </div>
    </form>
  );
};

const FieldInput = ({ field }: { field: keyof UserForm }) => {
  const [data, { mutateData, reset }] = useSimpleForm();
  const id = `user-form-${field}`;
  const value = data[field];
  const alert = useAlert();

  return (
    <div>
      <label htmlFor={id}>{field}: </label>
      <div style={{ color: 'red' }}>{alert[field].danger.has('required') && <>required</>}</div>
      <div style={{ color: 'red' }}>
        {field === 'age' && alert.age.danger.has('invalid-format') && <>age muet be a natural number.</>}
      </div>
      <div style={{ color: 'orange' }}>{field === 'age' && alert.age.warning.has('too-old') && <>are you an elf?</>}</div>
      <input
        value={value}
        onChange={e => {
          mutateData(field, e.target.value);
        }}
        id={id}
      />
      <button
        type='button'
        onClick={() => {
          reset(field);
        }}
      >
        reset {field}
      </button>
    </div>
  );
```

## Tips

### SimpleFormJotaiBound

"SimpleFormJotaiBound" is jotai's "Provider".
you can control a range that form-state is retained  by using "SimpleFormJotaiBound".

as like jotai, when you across over "SimpleFormJotaiBound", form-state is cleared.

### display the same form repeatedly

If you want to display the same form repeatedly, array-simple-form is useful.

Additional documentation will be added in the future.

```ts
import { initArraySimpleForm } from '@mm1995tk/simple-form';
```
