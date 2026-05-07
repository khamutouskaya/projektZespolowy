import { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "@/shared/theme/colors";

type Props = {
  visible: boolean;
  selectedCategory: string | null;
  onClose: () => void;
  onSelectCategory: (category: string) => void;
  onClearCategory: () => void;
};

const PRESET_CATEGORIES = ["Prywatne", "Nauka", "Praca", "Zdrowie"];

export default function PlannerCategoryModal({
  visible,
  selectedCategory,
  onClose,
  onSelectCategory,
  onClearCategory,
}: Props) {
  const [customCategory, setCustomCategory] = useState("");

  const isSelectedCustom = useMemo(() => {
    if (!selectedCategory) return false;
    return !PRESET_CATEGORIES.includes(selectedCategory);
  }, [selectedCategory]);

  const handleOpenCustomPrompt = () => {
    Alert.prompt?.(
      "Własny marker",
      "Wpisz swój marker",
      [
        {
          text: "Anuluj",
          style: "cancel",
        },
        {
          text: "Dodaj",
          onPress: (value?: string) => {
            const trimmed = value?.trim();

            if (!trimmed) return;
            onSelectCategory(trimmed);
          },
        },
      ],
      "plain-text",
      isSelectedCustom && selectedCategory ? selectedCategory : ""
    );
  };

  const handleFallbackCustomSave = () => {
    const trimmed = customCategory.trim();
    if (!trimmed) return;
    onSelectCategory(trimmed);
    setCustomCategory("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>Wybierz marker</Text>

            <Pressable onPress={onClose}>
              <Text style={styles.done}>Gotowe</Text>
            </Pressable>
          </View>

          <View style={styles.categoriesWrap}>
            {PRESET_CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;

              return (
                <Pressable
                  key={category}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                  ]}
                  onPress={() => onSelectCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.customButton} onPress={handleOpenCustomPrompt}>
            <Text style={styles.customButtonText}>Własny marker</Text>
          </Pressable>

          {!Alert.prompt && (
            <View style={styles.fallbackWrap}>
              <TextInput
                value={customCategory}
                onChangeText={setCustomCategory}
                placeholder="Wpisz swój marker"
                placeholderTextColor={colors.text.secondary}
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={handleFallbackCustomSave}
              />

              <Pressable
                style={styles.addButton}
                onPress={handleFallbackCustomSave}
              >
                <Text style={styles.addButtonText}>Dodaj</Text>
              </Pressable>
            </View>
          )}

          {selectedCategory && (
            <Pressable style={styles.clearRow} onPress={onClearCategory}>
              <Text style={styles.clearText}>Usuń marker</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  sheet: {
    backgroundColor: "#F7F7F8",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 36,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(90,90,90,0.55)",
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2F3B48",
  },
  done: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4C6EF5",
  },
  categoriesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(230,235,242,0.9)",
  },
  categoryChipSelected: {
    backgroundColor: "#7D8897",
  },
  categoryChipText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4F5D6B",
  },
  categoryChipTextSelected: {
    color: "#FFFFFF",
  },
  customButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(220,225,232,0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  customButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4C6EF5",
  },
  fallbackWrap: {
    marginTop: 6,
    gap: 10,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(220,225,232,0.95)",
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#4F5D6B",
  },
  addButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#4C6EF5",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  clearRow: {
    marginTop: 10,
    paddingTop: 10,
  },
  clearText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#D94B4B",
  },
});