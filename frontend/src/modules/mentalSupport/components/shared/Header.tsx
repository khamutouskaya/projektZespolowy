import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from "react-native";
import { typography } from "@/shared/theme/typography";
import { colors } from "@/shared/theme/colors";
import { useShopStore } from "@/services/store/useShopStore";
import { useEffect } from "react";
import { useAuthStore } from "@/services/store/useAuthStore";

type Props = {
  title: string;
  image: ImageSourcePropType;
};

export default function Header({ title, image }: Props) {
  const { equippedPreviewImage, fetchEquippedItem } = useShopStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchEquippedItem();
    }
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <Image source={equippedPreviewImage || image} style={styles.icon} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    //paddingHorizontal: 20,
    marginTop: 0,
  },

  title: {
    ...typography.name,
    color: colors.text.primary,
    paddingHorizontal: 10,
  },

  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 21,
    //backgroundColor: "#EAF6F6", // мягкий фон
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    width: 200,
    height: 150,
    resizeMode: "contain",
    //borderWidth: 1,
    //borderColor: "#6b6b6b",
  },
});
