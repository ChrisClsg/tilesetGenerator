// Rounds a given number to a given number of decimal places.
export default function toFixedNumber(number, digits) {
  const pow = Math.pow(10, digits)
  return Math.round(number * pow) / pow
}
