import type { Falsy } from '../../types';

export function classNames(...classes: (string | Falsy)[]) {
  return classes.filter(Boolean).join(` `);
}
