import { useTheme } from '@/hooks/useTheme';
import Colors from '@/utils/colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  message: string;
};

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {icon}
      <Text
        style={[styles.title, { color: Colors[theme].text }]}
        accessibilityRole="header"
      >
        {title}
      </Text>
      <Text style={[styles.message, { color: Colors[theme].textSecondary }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EmptyState;
