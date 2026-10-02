import LogEntryView from "@/components/views/log-entry-view";
import { useSystem } from "@/context";
import { getLogs } from "@/utilities/logger";
import * as Application from "expo-application";
import * as Device from "expo-device";
import { StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function About() {
  const { colorScheme } = useSystem();
  const insets = useSafeAreaInsets();

  const logs = getLogs();

  const styles = StyleSheet.create({
    view: {
      flex: 1,
      flexDirection: "column",
      backgroundColor: colorScheme.surface,
      paddingHorizontal: 16,
      paddingVertical: 8,
      // Edge-to-edge: the log panel would otherwise run under the navigation bar.
      paddingBottom: insets.bottom + 8,
      gap: 16
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    label: {
      color: colorScheme.onSurface,
      fontSize: 14,
    },
    value: {
      color: colorScheme.outline,
      fontSize: 14,
    },
    title: {
      marginTop: 16,
      textAlign: "center",
      color: colorScheme.onSurface,
      fontSize: 18,
      fontWeight: "bold",
    },
    logView: { 
      flex: 1, 
      backgroundColor: colorScheme.surfaceVariant, 
      padding: 10, 
      borderRadius: 8 
    },
    scrollView: { 
      flexGrow: 1 
    }
  });

  return (
    <View
      testID="about-page"
      style={styles.view}
    >
      <View style={styles.row}>
        <Text style={styles.label}>应用版本</Text>
        <Text style={styles.value}>{Application.nativeApplicationVersion}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>构建编号</Text>
        <Text style={styles.value}>{Application.nativeBuildVersion}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>设备型号</Text>
        <Text style={styles.value}>{Device.modelName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>运行内存</Text>
        <Text style={styles.value}>{((Device.totalMemory ?? 0) / (1024 * 1024 * 1024)).toFixed(2)} GB</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>处理器架构</Text>
        <Text style={styles.value}>{Device.supportedCpuArchitectures?.join(", ")}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>系统版本</Text>
        <Text style={styles.value}>{Device.osVersion}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>系统版本号</Text>
        <Text style={styles.value}>{Device.osBuildId}</Text>
      </View>
      <Text style={styles.title}>运行日志</Text>
      <View style={styles.logView}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <ScrollView
            horizontal
            contentContainerStyle={styles.scrollView}
            showsHorizontalScrollIndicator
          >
            <View>
              {logs.map((log, index) => (
                <LogEntryView key={index} entry={log} />
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      </View>
    </View>
  );
}

export default About;