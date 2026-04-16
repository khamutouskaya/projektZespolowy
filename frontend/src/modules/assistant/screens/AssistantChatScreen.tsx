import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import LayoutContainer from "@/shared/layout/LayoutContainer";
import { useRef, useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  PanResponder,
  StyleSheet,
  View,
} from "react-native";
import { AssistantComposer } from "../components/AssistantComposer";
import { AssistantEmptyState } from "../components/AssistantEmptyState";
import { AssistantHeader } from "../components/AssistantHeader";
import { MessageBubble } from "../components/MessageBubble";
import { AssistantTypingIndicator } from "../components/AssistantTypingIndicator";
import { PersonalityDrawer } from "../components/PersonalityDrawer";
import { useChat } from "../hooks/useChat";
import { assistantStarterPrompts } from "../prompts/motivation";
import type { Personality } from "../data/personalities";
import type { Message } from "../types/assistant.types";

export function AssistantChatScreen() {
  const { messages, isLoading, sendMessage, clearChat } = useChat();
  const flatListRef = useRef<FlatList<Message>>(null);
  const tabBarHeight = useBottomTabBarHeight();
  const hasMessages = messages.length > 0;
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPersonality, setSelectedPersonality] =
    useState<Personality | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const drawerOpenRef = useRef(drawerOpen);
  drawerOpenRef.current = drawerOpen;

  const edgePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        !drawerOpenRef.current && dx > 8 && Math.abs(dx) > Math.abs(dy),
      onPanResponderRelease: (_, { dx }) => {
        if (!drawerOpenRef.current && dx > 40) setDrawerOpen(true);
      },
    })
  ).current;

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
      flatListRef.current?.scrollToEnd({ animated: true });
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
      flatListRef.current?.scrollToEnd({ animated: true });
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <LayoutContainer>
      <PersonalityDrawer
        visible={drawerOpen}
        selectedId={selectedPersonality?.id ?? null}
        onSelect={setSelectedPersonality}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Thin left-edge zone — swipe right here to open the drawer */}
      <View style={styles.edgeZone} {...edgePanResponder.panHandlers} />

      <KeyboardAvoidingView style={styles.root} behavior="padding">
        <View style={styles.header}>
          <AssistantHeader
            title="Asystent"
            scrolled={isScrolled}
            onClearPress={clearChat}
            clearDisabled={!hasMessages}
            onMenuPress={() => setDrawerOpen(true)}
            personalityEmoji={selectedPersonality?.emoji}
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
          bottomOffset={keyboardVisible ? 14 : tabBarHeight + 20}
          isLoading={isLoading}
          onSendPress={(text) => {
            void sendMessage(text);
            Keyboard.dismiss();
          }}
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
  edgeZone: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 22,
    zIndex: 10,
  },
});
