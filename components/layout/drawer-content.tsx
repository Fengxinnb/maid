import ChatButton from "@/components/buttons/chat-button";
import { MaterialIconButton } from "@/components/buttons/icon-button";
import ConfirmView from "@/components/views/confirm-view";
import { useChat, useSystem } from "@/context";
import { validateMappings } from "@/utilities/mappings";
import { randomUUID } from "expo-crypto";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { addNode, getRoots } from "message-nodes";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 封心 AI：已移除账号（登录/注册）体系，抽屉底部不再有任何账号入口，
// 对话数据全部保存在本机。
function DrawerContent({ navigation }: { navigation?: { closeDrawer: () => void } }) {
  const { mappings, setMappings, setRoot } = useChat();
  const { colorScheme, systemPrompt } = useSystem();
  const insets = useSafeAreaInsets();
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const roots = getRoots<string>(mappings);

  const loadMappings = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        multiple: true,
      });

      if (result.canceled) return;

      for (const file of result.assets ?? []) {
        try {
          const content = await FileSystem.readAsStringAsync(file.uri);
          const parsed = JSON.parse(content);
          const validMap = validateMappings(parsed);
          setMappings(prev => ({ ...prev, ...validMap }));
        } catch (fileError) {
          console.warn(`Failed to load file: ${file.name}`, fileError);
        }
      }
    } catch (error) {
      console.warn("Failed to load mappings:", error);
    }
  };

  const clearChats = () => {
    setShowClearConfirm(false);
    setRoot(undefined);
    setMappings({});
  };

  const createChat = () => {
    const id = randomUUID();
    const time = new Date();
    setMappings((prev) => addNode<string>(
      prev,
      id,
      "system",
      systemPrompt || "你是一个乐于助人的助手。",
      id,
      undefined,
      undefined,
      {
        createTime: time.toISOString(),
      }
    ));
    setRoot(id);
  };
    
  const styles = StyleSheet.create({
    view: {
      flex: 1,
      flexDirection: "column",
    },
    divider: {
      height: 2,
      backgroundColor: colorScheme.outline,
      marginHorizontal: 18,
      marginVertical: 12,
      borderRadius: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      // The drawer is full height under edge-to-edge, so it owns both insets.
      paddingTop: insets.top + 16,
    },
    controlsText: {
      color: colorScheme.onSurface,
      fontSize: 16,
    },
    controls: {
      flexDirection: "row",
      alignItems: "center",
    },
    button: {
      marginHorizontal: 8,
    },
    sessions: {
      flex: 1,
      flexDirection: "column",
      // 没有账号入口后，列表底部仍留出手势区域的安全距离。
      paddingBottom: insets.bottom + 12,
    },
  });
    
  return (
    <View testID="drawer-content" style={styles.view}>
      <View style={styles.header}>
        <Text style={styles.controlsText}>对话列表</Text>
        <View style={styles.controls}>
          <MaterialIconButton
            testID="load-mappings-button"
            icon="folder-open"
            style={styles.button}
            size={24}
            onPress={loadMappings}
          />
          <MaterialIconButton
            testID="clear-chats-button"
            icon="delete"
            style={styles.button}
            size={24}
            disabled={roots.length === 0}
            onPress={() => setShowClearConfirm(true)}
          />
          <MaterialIconButton
            testID="new-chat-button"
            icon="add"
            style={styles.button}
            size={24}
            onPress={createChat}
          />
        </View>
      </View>
      <View style={styles.divider} />
      {/* Aware rather than plain: renaming a chat focuses a TextInput in this list. */}
      <KeyboardAwareScrollView style={styles.sessions} bottomOffset={16}>
        {roots.map((root, index) => <ChatButton testID={`chat-button-${index}`} key={root.id} node={root} />)}
      </KeyboardAwareScrollView>
      <View style={styles.divider} />
      <ConfirmView
        testID="clear-chats-confirm-modal"
        confirmTestID="clear-chats-confirm-button"
        cancelTestID="clear-chats-cancel-button"
        visible={showClearConfirm}
        message="确定要清空所有对话吗？此操作不可恢复。"
        onConfirm={clearChats}
        onCancel={() => setShowClearConfirm(false)}
      />
    </View>
  );
}

export default DrawerContent;