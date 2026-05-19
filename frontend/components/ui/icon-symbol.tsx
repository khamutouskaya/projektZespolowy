// Zamiennik dla MaterialIcons na Androidzie i w przeglądarce.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolViewProps, SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<
  SymbolViewProps["name"],
  ComponentProps<typeof MaterialIcons>["name"]
>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Dodaj tu mapowania SF Symbols → Material Icons.
 * - Material Icons: https://icons.expo.fyi
 * - SF Symbols: aplikacja SF Symbols od Apple
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
} as IconMapping;

/**
 * Komponent ikony używający SF Symbols na iOS oraz Material Icons na Androidzie i w przeglądarce.
 * Zapewnia spójny wygląd na wszystkich platformach przy optymalnym użyciu zasobów.
 * Nazwy ikon bazują na SF Symbols i wymagają ręcznego mapowania na Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
