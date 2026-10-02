import AssistantImageView from "@/components/views/assistant-image-view";
import { useSystem } from "@/context";
import * as ImagePicker from 'expo-image-picker';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

function AssistantSettingsGroup() {
  const { colorScheme, assistantName, setAssistantName, setAssistantImage } = useSystem();

  const styles = StyleSheet.create({
    view: {
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    },
    title: {
      color: colorScheme.onSurface,
      fontSize: 16,
      fontWeight: "bold"
    },
    button: { 
      color: colorScheme.primary,
      backgroundColor: colorScheme.surfaceVariant,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    input: {
      color: colorScheme.onSurface,
      backgroundColor: colorScheme.surfaceVariant,
      borderRadius: 30,
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      width: 300,
    }
  });

  const onPress = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("需要相册访问权限！");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setAssistantImage(pickerResult.assets[0].uri);
    }
  };

  return (
    <View
      style={styles.view}
    >
      <Text style={styles.title}>
        助手设置
      </Text>
      <AssistantImageView size={80} />
      <TouchableOpacity
        onPress={onPress}
      >
        <Text style={styles.button}>
          加载助手头像
        </Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="助手名称"
        placeholderTextColor={colorScheme.onSurface}
        underlineColorAndroid="transparent"
        value={assistantName}
        onChangeText={setAssistantName}
      />
    </View>
  );
}

export default AssistantSettingsGroup;