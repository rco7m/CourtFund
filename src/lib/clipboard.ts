// Keep clipboard usage safe even if the native module isn't linked yet.
// This prevents runtime crashes like "RNCClipboard could not be found".

export function trySetClipboardString(value: string): boolean {
  try {
    const mod = require('@react-native-clipboard/clipboard');
    const Clipboard = mod?.default ?? mod;
    if (Clipboard?.setString) {
      Clipboard.setString(value);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
