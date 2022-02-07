/**
 * returns a random k element subset of s
 */
export const randomChoose = (
  s: [number, number][],
  k: number
): [number, number][] => {
  let a: [number, number][] = [],
    i = -1,
    j: number;
  while (++i < k) {
    j = Math.floor(Math.random() * s.length);
    a.push(s.splice(j, 1)[0]);
  }
  return a;
};

/**
 * returns the list of all unordered pairs from s
 */
export const unorderedPairs = (s: number[]): [number, number][] => {
  let i = -1,
    a: [number, number][] = [],
    j: number;
  while (++i < s.length) {
    j = i;
    while (++j < s.length) a.push([s[i], s[j]]);
  }
  return a;
};
