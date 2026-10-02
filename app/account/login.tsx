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
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function Login() {
  const router = useRouter();
  const { colorScheme } = useSystem();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );

  const passwordValid = useMemo(
    () => password.length >= 8,
    [password]
  );

  const handleLogin = async () => {
    if (submitting) return;

    if (!emailValid) {
      Alert.alert("邮箱格式不正确", "请输入有效的邮箱地址。");
      return;
    }
    if (!passwordValid) {
      Alert.alert("密码不符合要求", "密码长度至少为 8 位。");
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await getSupabase().auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert("登录失败", error.message);
        return;
      }

      if (!data?.user) {
        Alert.alert("登录失败", "服务器返回异常，请稍后重试。");
        return;
      }

      Alert.alert("登录成功", "您已成功登录。");
      router.replace("/chat");
    } catch (error: any) {
      Alert.alert("登录失败", error.message);
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
      <View testID="login-page" style={styles.view}>
        <Text style={styles.title}>欢迎回来</Text>

        <TextInput
          style={styles.input}
          placeholder="邮箱"
          placeholderTextColor={colorScheme.onSurfaceVariant}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="密码"
          placeholderTextColor={colorScheme.onSurfaceVariant}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          autoComplete="password"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colorScheme.onPrimary} />
          ) : (
            <Text style={styles.buttonText}>登录</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity testID="register-link" onPress={() => router.replace("/account/register")}>
          <Text style={styles.linkText}>还没有账号？立即注册</Text>
        </TouchableOpacity>

        <TouchableOpacity testID="forgot-password-link" onPress={() => router.push("/account/reset-password" as any)}>
          <Text style={styles.linkText}>忘记密码？</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

export default Login;