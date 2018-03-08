import { ThemedStyledFunction } from 'styled-components';

export type Cell = {
  x: number,
  y: number,
  color: string,
};

// https://github.com/styled-components/styled-components/issues/630
export function withProps<U>() {
  return <P, T, O>(
    fn: ThemedStyledFunction<P, T, O>
  ): ThemedStyledFunction<P & U, T, O & U> => fn as ThemedStyledFunction<P & U, T, O & U>;
}