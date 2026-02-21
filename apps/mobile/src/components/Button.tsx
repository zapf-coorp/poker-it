import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Variant = "primary" | "secondary" | "destructive";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: object;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  style,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "destructive" && styles.destructive,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          (variant === "primary" || variant === "destructive") && styles.textLight,
          variant === "secondary" && styles.textSecondary,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  primary: {
    backgroundColor: "#0d6b0d",
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#0d6b0d",
  },
  destructive: {
    backgroundColor: "#b91c1c",
  },
  disabled: {
    opacity: 0.7,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  textLight: {
    color: "#fff",
  },
  textSecondary: {
    color: "#0d6b0d",
  },
});
