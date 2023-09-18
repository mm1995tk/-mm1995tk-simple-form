'use client';

import { initSimpleForm } from '@mm1995tk/simple-form';

export { SimpleFormJotaiBound } from '@mm1995tk/simple-form';

// init simple-form by passing validation variants
export const createSimpleForm = initSimpleForm('danger', 'warning', 'info');
