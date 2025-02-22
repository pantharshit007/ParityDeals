const compactNumFormatter = new Intl.NumberFormat(undefined, {
  notation: "compact",
  // compactDisplay: "long",
});

export function formatCompactNumber(number: number) {
  return compactNumFormatter.format(number);
}
