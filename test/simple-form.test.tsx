import { describe, test } from 'vitest';
import { initSimpleForm } from '../src';
import { emptyUser } from './domain';
import { render } from '@testing-library/react';
import React, { StrictMode } from 'react';

const createSimpleForm = initSimpleForm('danger', 'warning', 'info');

const { useSimpleForm, useHydrateForm } = createSimpleForm(emptyUser);

describe('', () => {
  const FormComponent = () => {
    useHydrateForm({ name: 'x', age: '20', note: 'hello' });
    const [formData] = useSimpleForm();

    return (
      <>
        <div>
          <label>{formData.name}</label>
        </div>
        <div></div>
        <div></div>
      </>
    );
  };
  test('hydrate', async () => {
    const { findByText } = render(
      <StrictMode>
        <FormComponent />
      </StrictMode>
    );
    await findByText('x');
  });
});
