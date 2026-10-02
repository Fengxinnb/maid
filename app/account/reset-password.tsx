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

export default function ResetPassword() {
  const router = useRouter();
  const { colorScheme } = useSystem();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );
  const newPasswordValid = useMemo(() => newPassword.length >= 8, [newPassword]);
  const passwordsMatch = useMemo(
    () => newPassword === confirmPassword,
    [newPassword, confirmPassword]
  );

  const handleSendOtp = async () => {
    if (submitting) return;

    if (!emailValid) {
      Alert.alert("邮箱格式不正确", "请输入有效的邮箱地址。");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim());

      if (error) {
        Alert.alert("错误", error.message);
        return;
      }

      setStep("otp");
    } catch (error: any) {
      Alert.alert("错误", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (submitting) return;

    if (!otp) {
      Alert.alert("验证码未填写", "请输入发送到您邮箱的验证码。");
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
      const { error: verifyError } = await getSupabase().auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: "recovery",
      });

      if (verifyError) {
        Alert.alert("验证码错误", verifyError.message);
        return;
      }

      const { error: updateError } = await getSupabase().auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        Alert.alert("重置失败", updateError.message);
        return;
      }

      Alert.alert("操作成功", "您的密码已重置。", [
        { text: "好的", onPress: () => router.replace("/account/login") },
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
      marginBottom: 8,
    },
    subtitle: {
      color: colorScheme.onSurfaceVariant,
      fontSize: 14,
      textAlign: "center",
      marginBottom: 8,
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

  if (step === "email") {
    return (
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        bottomOffset={16}
      >
        <View testID="reset-password-page" style={styles.view}>
          <Text style={styles.title}>重置密码</Text>
          <Text style={styles.subtitle}>
            请输入您的邮箱，我们会发送一枚验证码用于重置密码。
          </Text>

          <TextInput
            style={styles.input}
            placeholder="邮箱"
            placeholderTextColor={colorScheme.onSurfaceVariant}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSendOtp}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colorScheme.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>发送验证码</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>返回登录</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      bottomOffset={16}
    >
      <View testID="reset-password-otp-page" style={styles.view}>
        <Text style={styles.title}>输入验证码</Text>
        <Text style={styles.subtitle}>
          我们已向 {email} 发送验证码，请在下方输入并设置新密码。
        </Text>

        <TextInput
          style={styles.input}
          placeholder="6 位验证码"
          placeholderTextColor={colorScheme.onSurfaceVariant}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
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
          onPress={handleResetPassword}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colorScheme.onPrimary} />
          ) : (
            <Text style={styles.buttonText}>重置密码</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setStep("email")}>
          <Text style={styles.linkText}>重新发送验证码</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}