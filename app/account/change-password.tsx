import { useSystem } from "@/context";
import getSupabase from "@/utilities/supabase";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChangePassword() {
  const router = useRouter();
  const { colorScheme } = useSystem();
  const insets = useSafeAreaInsets();

  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const newPasswordValid = useMemo(() => newPassword.length >= 8, [newPassword]);
  const passwordsMatch = useMemo(
    () => newPassword === confirmPassword,
    [newPassword, confirmPassword]
  );

  const handleChangePassword = async () => {
    if (submitting) return;

    if (!currentPassword) {
      Alert.alert("信息未填写", "请输入当前密码。");
      return;
    }
    if (!newPasswordValid) {
      Alert.alert("密码不符合要求", "新密码长度至少为 8 位。");
      return;
    }
    if (!passwordsMatch) {
      Alert.alert("两次密码不一致", "两次输入的新密码不一致。");
      return;
    }

    setSubmitting(true);

    try {
      const { data: sessionData } = await getSupabase().auth.getSession();
      const email = sessionData.session?.user?.email;

      if (!email) {
        Alert.alert("错误", "无法获取账号信息。");
        return;
      }

      const { error: signInError } = await getSupabase().auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) {
        Alert.alert("当前密码错误", "您输入的当前密码不正确。");
        return;
      }

      const { error: updateError } = await getSupabase().auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        Alert.alert("修改失败", updateError.message);
        return;
      }

      Alert.alert("操作成功", "您的密码已更新。", [
        { text: "好的", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("错误", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.surface,
    },
    content: {
      flexGrow: 1,
      justifyContent: "center",
      // Edge-to-edge: keep the form clear of the navigation bar.
      paddingBottom: insets.bottom,
    },
    view: {
      alignItems: "center",
      flexDirection: "column",
      gap: 16,
      paddingHorizontal: 48,
      paddingBottom: 64,
    },
    title: {
      color: colorScheme.primary,
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
    },
    input: {
      color: colorScheme.onSurface,
      backgroundColor: colorScheme.surfaceVariant,
      borderRadius: 30,
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      width: "100%",
    },
    button: {
      backgroundColor: colorScheme.primary,
      borderRadius: 20,
      paddingVertical: 12,
      paddingHorizontal: 48,
      marginTop: 8,
    },
    buttonText: {
      color: colorScheme.onPrimary,
      fontSize: 16,
      textAlign: "center",
      fontWeight: "bold",
    },
    linkText: {
      color: colorScheme.primary,
      fontSize: 14,
      marginTop: 12,
    },
  });

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      bottomOffset={16}
    >
      <View testID="change-password-page" style={styles.view}>
        <Text style={styles.title}>修改密码</Text>

        <TextInput
          style={styles.input}
          placeholder="当前密码"
          placeholderTextColor={colorScheme.onSurfaceVariant}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          autoComplete="password"
        />

        <TextInput
          style={styles.input}
          placeholder="新密码"
          placeholderTextColor={colorScheme.onSurfaceVariant}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          autoComplete="new-password"
        />

        <TextInput
          style={styles.input}
          placeholder="确认新密码"
          placeholderTextColor={colorScheme.onSurfaceVariant}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          autoComplete="new-password"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleChangePassword}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colorScheme.onPrimary} />
          ) : (
            <Text style={styles.buttonText}>更新密码</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>取消</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}