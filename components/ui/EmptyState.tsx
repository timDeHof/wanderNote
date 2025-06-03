import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import Colors from '@/utils/colors';

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
      <Text style={[styles.title, { color: Colors[theme].text }]}>
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
    justifyContent: 'center',
    padding: 40,
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
  },
});

export default EmptyState;