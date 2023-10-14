import { describe, expect, test } from 'vitest';
import { initSimpleForm } from '../../src';
import { emptyUser } from '../test-data/domain';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserForm } from '../test-data/types';
import TestProvider from '../provider';

const createSimpleForm = initSimpleForm('danger', 'warning', 'info');
const { useSimpleForm, useHydrateForm } = createSimpleForm(emptyUser);

describe('test of hydration', () => {
  test('reset', async () => {
    const user = { name: 'x', age: '20', note: 'hello' };

    const FormComponent = ({ initialValue }: { initialValue: UserForm }) => {
      useHydrateForm(initialValue);
      const [formData, { reset, mutateData }] = useSimpleForm();

      const usernameInput = 'username-input';
      const userAgeInput = 'user-age-input';

      return (
        <>
          <label htmlFor={usernameInput}>name</label>
          <input
            value={formData.name}
            id={usernameInput}
            onChange={e => {
              mutateData('name', e.target.value);
            }}
          />

          <button
            onClick={() => {
              reset('name');
            }}
            data-testid={'reset-name'}
          >
            reset name
          </button>

          <label htmlFor={userAgeInput}>age</label>
          <input
            value={formData.age}
            id={userAgeInput}
            onChange={e => {
              mutateData('age', e.target.value);
            }}
          />

          <button
            onClick={() => {
              reset();
            }}
            data-testid={'reset-all'}
          >
            reset all
          </button>
        </>
      );
    };

    const { unmount } = render(
      <TestProvider>
        <FormComponent initialValue={user} />
      </TestProvider>
    );

    const nameInput = screen.getByLabelText<HTMLInputElement>('name');
    const ageInput = screen.getByLabelText<HTMLInputElement>('age');

    const newName = 'yyy';
    const newAge = '21';
    fireEvent.change(nameInput, { target: { value: newName } });
    fireEvent.change(ageInput, { target: { value: newAge } });
    expect(nameInput.value).toBe(newName);

    const btn = screen.getByTestId('reset-name');
    fireEvent.click(btn);
    expect(nameInput.value).toBe(user.name);

    // reset('name')が発火してもageはレセットされない
    expect(ageInput.value).toBe(newAge);

    const resetAllBtn = screen.getByTestId('reset-all');
    fireEvent.click(resetAllBtn);
    expect(nameInput.value).toBe(user.name);
    expect(ageInput.value).toBe(user.age);

    unmount();
  });
});
