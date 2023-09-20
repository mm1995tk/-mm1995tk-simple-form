import { describe, test } from 'vitest';
import { initSimpleForm } from '../src';
import { emptyUser } from './test-data/domain';
import { render } from '@testing-library/react';
import { UserForm } from './test-data/types';
import TestProvider from './provider';

const createSimpleForm = initSimpleForm('danger', 'warning', 'info');
const { useSimpleForm, useHydrateForm } = createSimpleForm(emptyUser);

describe('test of hydration', () => {
  test('hydrate', async () => {
    const user = { name: 'x', age: '20', note: 'hello' };

    const FormComponent = ({ initialValue }: { initialValue: UserForm }) => {
      useHydrateForm(initialValue);
      const [formData] = useSimpleForm();

      return (
        <>
          <div>{formData.name}</div>
          <div>{formData.age}</div>
          <div>{formData.note}</div>
        </>
      );
    };

    const { findByText, unmount } = render(
      <TestProvider>
        <FormComponent initialValue={user} />
      </TestProvider>
    );

    await Promise.all([
      //
      findByText(user.name),
      findByText(user.age),
      findByText(user.note),
    ]);

    unmount();
  });

  test('hydrate no args', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const FormComponent = (_: { initialValue: UserForm }) => {
      useHydrateForm();
      const [formData] = useSimpleForm();

      return (
        <>
          <div>{formData.name || 'empty-name'}</div>
          <div>{formData.age || 'empty-age'}</div>
          <div>{formData.note || 'empty-note'}</div>
        </>
      );
    };

    const { findByText, unmount } = render(
      <TestProvider>
        <FormComponent initialValue={emptyUser} />
      </TestProvider>
    );

    await Promise.all([
      //
      findByText('empty-name'),
      findByText('empty-age'),
      findByText('empty-note'),
    ]);

    unmount();
  });

  test('no hydration', async () => {
    const { useSimpleForm } = createSimpleForm(emptyUser);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const FormComponent = (_: { initialValue: UserForm }) => {
      const [formData] = useSimpleForm();

      return (
        <>
          <div>{formData.name || 'empty-name'}</div>
          <div>{formData.age || 'empty-age'}</div>
          <div>{formData.note || 'empty-note'}</div>
        </>
      );
    };

    const { findByText, unmount } = render(
      <TestProvider>
        <FormComponent initialValue={emptyUser} />
      </TestProvider>
    );

    await Promise.all([
      //
      findByText('empty-name'),
      findByText('empty-age'),
      findByText('empty-note'),
    ]);
    unmount();
  });
});
