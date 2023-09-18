'use client';
import { useAlert, useHydrateForm, useSimpleForm } from './hooks';
import { UserForm } from './types';

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
};
