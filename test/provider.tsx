import React from 'react';
import { SimpleFormJotaiBound } from '../src';

const TestProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <React.StrictMode>
      <SimpleFormJotaiBound>{children}</SimpleFormJotaiBound>
    </React.StrictMode>
  );
};

export default TestProvider;
