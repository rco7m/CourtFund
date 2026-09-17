// `@firebase/auth`'s package.json exports map resolves TypeScript types via a
// top-level "types" condition that always wins over the "react-native"
// condition, so `getReactNativePersistence` (only declared in the
// react-native-specific type file) is invisible to a normal import — even
// though Metro resolves the real react-native build correctly at runtime.
// This augments the public types with the one export that's missing.
import type { Persistence } from '@firebase/auth';

declare module '@firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence;
}
