import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

// 封心 AI：去掉了账号体系，头像不再上传/读取 Supabase Storage，
// 只在本机保存图片 URI（AsyncStorage），行为与未登录时完全一致。
function useSyncedImage(
  options: { key: string, bucket: string, ext?: string }
): [string | undefined, Dispatch<SetStateAction<string | undefined>>] {
  const { key } = options;
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  const hydratingRef = useRef(false);

  const saveLocal = async (uri: string | undefined) => {
    try {
      if (uri) await AsyncStorage.setItem(key, uri);
      else await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`Error saving ${key}:`, e);
    }
  };

  const loadLocal = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error(`Error loading ${key}:`, e);
      return null;
    }
  };

  // Load on mount / when the storage key changes
  useEffect(() => {
    (async () => {
      hydratingRef.current = true;
      try {
        const local = await loadLocal();
        setImageUri(local ?? undefined);
      } finally {
        hydratingRef.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist when changed
  useEffect(() => {
    (async () => {
      if (hydratingRef.current) return;
      await saveLocal(imageUri);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUri]);

  return [imageUri, setImageUri];
}

export default useSyncedImage;