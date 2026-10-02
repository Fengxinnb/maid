import { useSystem } from "@/context";
import { StyleSheet, Text, TextInput, View } from "react-native";

function SystemSettingsGroup() {
  const { colorScheme, systemPrompt, setSystemPrompt } = useSystem();

  const styles = StyleSheet.create({
    view: {
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      paddingHorizontal: 16,
      width: "100%",
      paddingBottom: 16,
    },
    title: {
      color: colorScheme.onSurface,
      fontSize: 16,
      fontWeight: "bold"
    },
    input: {
      color: colorScheme.onSurface,
      backgroundColor: colorScheme.surfaceVariant,
      borderRadius: 30,
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      width: "100%",
    }
  });

  return (
    <View
      style={styles.view}
    >
      <Text
        style={styles.title}
      >
        系统设置
      </Text>
      <TextInput
        style={styles.input}
        placeholder="系统提示词"
        placeholderTextColor={colorScheme.onSurface}
        value={systemPrompt}
        onChangeText={setSystemPrompt}
        multiline
      />
    </View>
  );
}

export default SystemSettingsGroup;