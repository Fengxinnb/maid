import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

// 封心 AI：去掉了账号体系，原本「登录后同步到云端」的分支已移除，
// 该 hook 现在只负责本机持久化（AsyncStorage），行为与未登录时完全一致。
function useSyncedString(
  options: { key: string, defaultValue: string }
): [string | undefined, Dispatch<SetStateAction<string | undefined>>] {
  const { key, defaultValue } = options;

  const [value, setValue] = useState<string | undefined>(undefined);

  // Avoid saving before we've loaded once.
  const hydratedRef = useRef(false);

  // 1) LOAD (on mount / when the key changes)
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      hydratedRef.current = false;

      try {
        const stored = await AsyncStorage.getItem(key);
        if (cancelled) return;
        setValue(stored ?? defaultValue);
      } catch (e) {
        console.error(`Error loading ${key}:`, e);
        if (!cancelled) setValue(defaultValue);
      } finally {
        if (!cancelled) hydratedRef.current = true;
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [key, defaultValue]);

  // 2) SAVE (when value changes, after initial hydration)
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (value === undefined) return;

    const persist = async () => {
      try {
        // Treat default/empty as "unset".
        if (value && value !== defaultValue) {
          await AsyncStorage.setItem(key, value);
        } else {
          await AsyncStorage.removeItem(key);
        }
      } catch (e) {
        console.error(`Error saving ${key}:`, e);
      }
    };

    persist();
  }, [value, key, defaultValue]);

  return [value, setValue];
}

export default useSyncedString;