import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can customize this error UI
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Separate functional component for the error UI to allow use of hooks
function ErrorFallback({ error }: { error?: Error }) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Something went wrong</Text>
      <Text style={[styles.message, { color: textColor }]}>
        {error?.message || 'An unexpected error occurred'}
      </Text>
      <Text style={[styles.hint, { color: textColor }]}>
        Please try restarting the app. If the problem persists, contact support.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    opacity: 0.7,
  },
});
