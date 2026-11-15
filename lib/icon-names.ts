/**
 * lucide icon metadata uses kebab-case names (`arrow-up`), while the React
 * package exports PascalCase components (`ArrowUp`).
 */
export function capitalizeIconName(iconName: string): string {
  return iconName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}
