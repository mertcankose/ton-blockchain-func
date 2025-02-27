/**
 * Formats a bigint value to a string with the specified number of decimals
 * @param value The value to format
 * @param decimals The number of decimals
 * @returns The formatted string
 */
export function formatUnits(value: bigint, decimals: number): string {
  if (value === BigInt(0)) return '0';
  
  const valueStr = value.toString();
  
  // If the value is less than 10^decimals, we need to pad it with leading zeros
  if (valueStr.length <= decimals) {
    return '0.' + valueStr.padStart(decimals, '0');
  }
  
  // Insert the decimal point at the right position
  const integerPart = valueStr.slice(0, valueStr.length - decimals);
  const fractionalPart = valueStr.slice(valueStr.length - decimals);
  
  // Remove trailing zeros from fractional part
  const trimmedFractionalPart = fractionalPart.replace(/0+$/, '');
  
  if (trimmedFractionalPart.length === 0) {
    return integerPart;
  }
  
  return integerPart + '.' + trimmedFractionalPart;
} 