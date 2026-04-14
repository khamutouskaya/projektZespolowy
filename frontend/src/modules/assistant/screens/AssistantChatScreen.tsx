import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import LayoutContainer from "@/shared/layout/LayoutContainer";
import { useRef, useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  StyleSheet,
  View,
} from "react-native";
import { AssistantComposer } from "../components/AssistantComposer";
import { AssistantEmptyState } from "../components/AssistantEmptyState";
import { AssistantHeader } from "../components/AssistantHeader";
import { MessageBubble } from "../components/MessageBubble";
import { AssistantTypingIndicator } from "../components/AssistantTypingIndicator";
import { useChat } from "../hooks/useChat";
import { assistantStarterPrompts } from "../prompts/motivation";
import type { Message } from "../types/assistant.types";
//import { View } from "react-native-reanimated/lib/typescript/Animated";

export function AssistantChatScreen() {
  const {
    messages,
    inputText,
    setInputText,
    isLoading,
    sendMessage,
    clearChat,
  } = useChat();
  const flatListRef = useRef<FlatList<Message>>(null);
  const tabBarHeight = useBottomTabBarHeight();
  const hasMessages = messages.length > 0;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
    return () => { show.remove(); hide.remove(); };
  }, []);

  return (
    <LayoutContainer>
      <KeyboardAvoidingView
        style={styles.root}
        behavior="padding"
      >
        <View style={styles.header}>
          <AssistantHeader
            title="Asystent"
            scrolled={isScrolled}
            onClearPress={clearChat}
            clearDisabled={!hasMessages}
          />
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          style={styles.list}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          onScroll={(e) => setIsScrolled(e.nativeEvent.contentOffset.y > 5)}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          scrollIndicatorInsets={{ right: 2 }}
          contentContainerStyle={[
            styles.listContent,
            !hasMessages && styles.listContentEmpty,
          ]}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: hasMessages })
          }
          ListEmptyComponent={
            <AssistantEmptyState
              prompts={assistantStarterPrompts}
              onPromptPress={(prompt) => void sendMessage(prompt)}
            />
          }
        />

        {isLoading && <AssistantTypingIndicator />}

        <AssistantComposer
          bottomOffset={tabBarHeight + 8}
          inputText={inputText}
          isLoading={isLoading}
          onChangeText={setInputText}
          onSendPress={() => { void sendMessage(); Keyboard.dismiss(); }}
          onVoicePress={() => {}}
        />
      </KeyboardAvoidingView>
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 10,
    marginHorizontal: -16,
    //borderBottomWidth: 0.2,
    //borderColor: "hsla(295, 6%, 38%, 0.50)",
  },

  root: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 16,
  },

  list: {
    flex: 1,
    marginRight: -16,
    marginTop: -5,
  },
  listContent: {
    paddingBottom: 10,
    paddingRight: 16,
    flexGrow: 1,
  },
  listContentEmpty: {
    justifyContent: "center",
  },
});
