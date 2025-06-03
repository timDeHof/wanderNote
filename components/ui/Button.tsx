import { useTheme } from '@/hooks/useTheme';
import Colors from '@/utils/colors';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? Colors[theme].textSecondary : Colors[theme].primary,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? Colors[theme].textSecondary : Colors[theme].secondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? Colors[theme].textSecondary : Colors[theme].primary,
        };
      case 'danger':
        return {
          backgroundColor: disabled ? Colors[theme].textSecondary : Colors[theme].danger,
        };
      default:
        return {
          backgroundColor: disabled ? Colors[theme].textSecondary : Colors[theme].primary,
        };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return {
          color: disabled ? Colors[theme].textSecondary : Colors[theme].primary,
        };
      default:
        return {
          color: '#FFFFFF',
        };
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return {
          height: 36,
          paddingHorizontal: 12,
          borderRadius: 6,
        };
      case 'large':
        return {
          height: 56,
          paddingHorizontal: 24,
          borderRadius: 12,
        };
      default:
        return {
          height: 48,
          paddingHorizontal: 20,
          borderRadius: 8,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return {
          fontSize: 14,
        };
      case 'large':
        return {
          fontSize: 18,
        };
      default:
        return {
          fontSize: 16,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getButtonSize(),
        disabled || isLoading ? styles.disabled : null,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF\" size="small" />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              getTextStyle(),
              getTextSize(),
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default Button;
