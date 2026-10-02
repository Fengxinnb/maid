import { MaterialCommunityIconButton } from "@/components/buttons/icon-button";
import { useChat, useLLM, useSystem } from "@/context";
import getMetadata from "@/utilities/metadata";
import splitReasoning from "@/utilities/reasoning";
import getSupabase from "@/utilities/supabase";
import Markdown from '@novastera-oss/react-native-markdown-display';
import { randomUUID } from "expo-crypto";
import { addNode, branchNode, getConversation, MessageNode, updateContent } from "message-nodes";
import { useState } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableHighlight, View } from "react-native";
import NeuralNetworkAnimation from "../neural-network-animation";

export async function insertReport(
  content: string,
  provider: string,
  model: string,
  upvoted: boolean = false
): Promise<void> {
  try {
    // 1) Ensure we have a signed-in user (anonymous if needed)
    const { data: sessionRes, error: sessionErr } = await getSupabase().auth.getSession();
    if (sessionErr) console.warn("getSession error:", sessionErr);

    let userId = sessionRes?.session?.user?.id;

    if (!userId) {
      const authAny = getSupabase().auth as any;

      if (typeof authAny.signInAnonymously !== "function") {
        console.error("signInAnonymously() not available. Update getSupabase-js and enable anonymous sign-ins in Supabase.");
        Alert.alert("反馈提交失败", "当前无法登录。");
        return;
      }

      const { data: anonRes, error: anonErr } = await authAny.signInAnonymously();
      if (anonErr || !anonRes?.user?.id) {
        console.error("Anonymous sign-in failed:", anonErr);
        Alert.alert("反馈提交失败", "登录失败，请稍后重试。");
        return;
      }
    }

    // 2) Insert report
    const { error } = await getSupabase().from("reports").insert({
      content,
      provider,
      model,
      upvoted
    });

    if (error) {
      console.error("Error inserting report:", error);
      Alert.alert("反馈提交失败", error.message);
      return;
    }

    Alert.alert("反馈已提交", "感谢您的反馈！", [{ text: "好的" }], {
      cancelable: true,
    });
  } catch (e) {
    console.error("insertReport unexpected error:", e);
    Alert.alert("反馈提交失败", "发生意外错误，请重试。");
  }
}

function MessageContentView({ message }: { message: MessageNode }) {
  const [ showReasoning, setShowReasoning ] = useState<boolean>(false);
  const [ editText, setEditText ] = useState<string>(message.content);
  const { mappings, setMappings, editing, setEditing } = useChat();
  const { colorScheme } = useSystem();
  const LLM = useLLM();

  const styles = StyleSheet.create({
    view: {
      flexDirection: "column",
      alignItems: "flex-start",
      width: "100%",
      gap: 8,
    },
    controls: {
      marginTop: 10,
      width: "100%",
      gap: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    showReasoningButton: {
      alignSelf: "center",
    },
    showReasoningButtonText: {
      color: colorScheme.primary,
      fontSize: 14,
    },
    reasoning: {
      color: colorScheme.outline,
      fontSize: 14,
      fontStyle: "italic",
    },
    content: {
      color: colorScheme.onSurface,
      fontSize: 14,
      paddingHorizontal: 0,
    },
  });

  const markdownStyle = StyleSheet.create({
    body: {
      color: colorScheme.onSurface,
      fontSize: 14,
    },
    link: {
      color: colorScheme.primary,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: colorScheme.primary,
      paddingLeft: 12,
      marginLeft: 8,
      backgroundColor: colorScheme.surfaceVariant,
      color: colorScheme.onSurface,
      borderRadius: 4,
      paddingVertical: 8,
    },
    code_inline: {
      backgroundColor: colorScheme.surfaceVariant,
      color: colorScheme.onSurface,
      borderRadius: 4,
    },
    code_block: {
      backgroundColor: colorScheme.surfaceVariant,
      color: colorScheme.onSurface,
      borderWidth: 0,
      borderRadius: 4,
      padding: 8,
    },
    fence: {
      backgroundColor: colorScheme.surfaceVariant,
      color: colorScheme.onSurface,
      borderWidth: 0,
      borderRadius: 4,
      padding: 8,
    },
    hr: {
      backgroundColor: colorScheme.outline,
      marginVertical: 16,
    }
  });

  const onEdit = () => {
    if (!message.root) {
      Alert.alert("错误", "无法编辑该消息：它所属的对话根节点已丢失。");
      return;
    }

    const id = randomUUID();
    let next = branchNode<string>(
      mappings, 
      message.id,
      id,
      editText,
      getMetadata()
    );

    const responseId = randomUUID();
    next = addNode<string>(
      next,
      responseId,
      "assistant",
      "",
      message.root,
      id,
      undefined,
      {
        ...getMetadata(),
        ...LLM.parameters,
        provider: LLM.type.toLowerCase().replace(" ", "-"),
        model: LLM.model || LLM.modelKey,
      }
    );

    setMappings(next);

    const chunks: string[] = [];
    const updateMeta = (meta: any) => ({ ...meta, updateTime: new Date().toISOString() });
    try {
      LLM.prompt(
        getConversation(next, message.root),
        (chunk: string) => {
          chunks.push(chunk);
          const buffer = chunks.join("");
          setMappings(updateContent(next, responseId, buffer, updateMeta));
        }
      );
    } catch (error) {
      Alert.alert(
        "编辑失败",
        "获取更新后的回复时出现问题，请重试。"
      );
    }

    onEditDone();
  };

  const onEditDone = () => {
    setEditing(undefined);
    setEditText(message.content);
  };

  const [content, reasoning] = splitReasoning(message);

  if (editing === message.id) {
    return (
      <View style={styles.view}>
        <TextInput
          style={styles.content}
          value={editText}
          onChangeText={(text) => setEditText(text)}
          multiline
        />
        <View
          style={styles.controls}
        >
          <MaterialCommunityIconButton
            icon="check"
            onPress={onEdit}
          />
          <MaterialCommunityIconButton
            icon="close"
            onPress={onEditDone}
          />
        </View>
      </View>
    );
  }

  const images: string[] = message.metadata?.images ?? [];

  return (
    <View style={styles.view}>
      {images.map((b64, i) => (
        <Image
          key={i}
          source={{ uri: b64 }}
          style={{ width: "80%", alignSelf: "center", borderRadius: 8, aspectRatio: 1, resizeMode: "cover", marginVertical: 16 }}
        />
      ))}
      {reasoning && (
        <TouchableHighlight style={styles.showReasoningButton} onPress={() => setShowReasoning(!showReasoning)}>
          <Text style={styles.showReasoningButtonText}>{showReasoning ? "隐藏推理过程" : "显示推理过程"}</Text>
        </TouchableHighlight>
      )}
      {reasoning && showReasoning && <Text style={styles.reasoning}>{reasoning}</Text>}
      {content && <Markdown style={markdownStyle}>{content}</Markdown>}
      {message.role === "assistant" && message.content.length > 0 && (
        <View
          style={styles.controls}
        >
          <MaterialCommunityIconButton
            icon="thumb-up"
            size={22}
            onPress={() => insertReport(message.content, LLM.type, LLM.model || LLM.modelKey || "", true)}
            color={colorScheme.secondary}
          />
          <MaterialCommunityIconButton
            icon="thumb-down"
            size={22}
            onPress={() => insertReport(message.content, LLM.type, LLM.model || LLM.modelKey || "", false)}
            color={colorScheme.secondary}
          />
        </View>
      )}
      {message.content.length === 0 && !message.child && (
        LLM.busy ? 
          <NeuralNetworkAnimation repeat={true} /> : 
          <Text style={styles.reasoning}>[无内容]</Text>
        )
      }
    </View>
  );
};

export default MessageContentView;