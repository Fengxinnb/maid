import AssistantImageView from "@/components/views/assistant-image-view";
import UserImageView from "@/components/views/user-image-view";
import { useSystem } from "@/context";
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { MessageNode } from "message-nodes";
import { StyleSheet, Text, View } from "react-native";


function MessageRoleView({ message }: { message: MessageNode }) {
  const { userName, assistantName, colorScheme } = useSystem();

  const styles = StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8
    },
    role: {
      color: colorScheme.secondary,
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 8,
    },
  });

  const roleNames: Record<string, string | undefined> = {
    user: userName,
    assistant: assistantName,
  };

  const avatars: Record<string, React.ReactNode> = {
    user: <UserImageView size={28} />,
    assistant: <AssistantImageView size={28} />,
  };

  // 内置角色的中文名称，未自定义用户名/助手名时使用
  const defaultRoles: Record<string, string> = {
    user: "用户",
    assistant: "助手",
    system: "系统",
    tool: "工具",
  };

  const role = roleNames[message.role] ?? defaultRoles[message.role] ?? message.role;
  const profile = avatars[message.role] ?? <Icon name="account-cog" size={28} color={colorScheme.secondary} />;

  return (
    <View style={styles.row}>
      {profile}
      <Text style={[styles.role, { color: colorScheme.secondary }]}>
        {role}
      </Text>
    </View>
  );
}

export default MessageRoleView;