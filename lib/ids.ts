export function generateNumericId(length: number): string {
  const first = Math.floor(Math.random() * 9) + 1;
  let value = String(first);

  while (value.length < length) {
    value += Math.floor(Math.random() * 10);
  }

  return value;
}

export function generateAccountNumber(): string {
  return generateNumericId(8);
}

export function generateSiteNumber(): string {
  return generateNumericId(12);
}
