import { useSystem } from "@/context";
import { LogEntry } from "@/utilities/logger";
import { StyleSheet, Text, View } from "react-native";

function LogEntryView({ entry }: { entry: LogEntry }) {
  const { colorScheme } = useSystem();
  
  const colors = {
    log: "#4caf50",
    warn: "#ff9800",
    error: "#f44336",
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "flex-start",
      gap: 16,
      marginVertical: 4,
    },
    level: {
      backgroundColor: colors[entry.level],
      textAlign: "center",
      color: colorScheme.surface,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      fontWeight: "bold",
      width: 80,
    },
    message: {
      color: colorScheme.onSurface,
    },
  });

  const levelNames: Record<string, string> = {
    log: "日志",
    warn: "警告",
    error: "错误",
  };

  return (
    <View style={styles.container}>
      <Text style={styles.level}>{levelNames[entry.level] ?? entry.level.toUpperCase()}</Text>
      <Text style={styles.message}>{entry.message}</Text>
    </View>
  );
}

export default LogEntryView;