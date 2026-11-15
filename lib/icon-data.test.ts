import { describe, expect, it } from 'vitest';
import * as Icons from 'lucide-react';
import iconMetaData from './data/iconMetaData';
import { capitalizeIconName } from './icon-names';

describe('capitalizeIconName', () => {
  it('turns kebab-case names into lucide exports', () => {
    expect(capitalizeIconName('arrow-up')).toBe('ArrowUp');
    expect(capitalizeIconName('a-arrow-down')).toBe('AArrowDown');
    expect(capitalizeIconName('accessibility')).toBe('Accessibility');
  });
});

describe('iconMetaData', () => {
  it('only references icons that exist in the installed lucide version', () => {
    const components = Icons as unknown as Record<string, unknown>;
    const missing = Object.keys(iconMetaData)
      .map(capitalizeIconName)
      .filter((iconName) => !components[iconName]);

    expect(missing).toEqual([]);
  });
});
