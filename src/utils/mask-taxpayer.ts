export function maskTaxpayer(taxpayer: string): string {
  const clean = taxpayer.replaceAll(/\D/g, '');

  if (clean.length === 11) {
    return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
  }

  if (clean.length === 14) {
    return `**.${clean.slice(2, 5)}.***/****-${clean.slice(12, 14)}`;
  }

  return taxpayer;
}
