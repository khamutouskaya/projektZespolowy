import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from "react-native";
import { typography } from "@/shared/theme/typography";
import { colors } from "@/shared/theme/colors";

type Props = {
  title: string;
  image: ImageSourcePropType;
};

export default function Header({ title, image }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <Image source={image} style={styles.icon} />
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
