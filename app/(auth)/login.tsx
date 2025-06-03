import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import Colors from '@/utils/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { Globe, Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setError('');
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login with Google');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: Colors[theme].background }
      ]}
    >
      <Animated.View entering={FadeIn.duration(800)} style={styles.logoContainer}>
        <LinearGradient
          colors={['#0AB68B', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoBackground}
        >
          <Globe size={40} color="#FFF" />
        </LinearGradient>
        <Text style={[styles.logoText, { color: Colors[theme].text }]}>
          Travel Log
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeIn.duration(800).delay(200)}
        style={[
          styles.formContainer,
          { backgroundColor: Colors[theme].card }
        ]}
      >
        <Text style={[styles.title, { color: Colors[theme].text }]}>
          Welcome Back
        </Text>

        <View style={styles.inputContainer}>
          <Mail size={20} color={Colors[theme].textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[
              styles.input,
              {
                color: Colors[theme].text,
                borderColor: Colors[theme].border
              }
            ]}
            placeholder="Email"
            placeholderTextColor={Colors[theme].textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color={Colors[theme].textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[
              styles.input,
              {
                color: Colors[theme].text,
                borderColor: Colors[theme].border
              }
            ]}
            placeholder="Password"
            placeholderTextColor={Colors[theme].textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <Button
          title="Log in"
          onPress={handleLogin}
          isLoading={loading}
          style={{ marginTop: 24 }}
        />

        <View style={styles.orContainer}>
          <View style={[styles.divider, { backgroundColor: Colors[theme].border }]} />
          <Text style={[styles.orText, { color: Colors[theme].textSecondary }]}>or</Text>
          <View style={[styles.divider, { backgroundColor: Colors[theme].border }]} />
        </View>

        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Text style={[styles.socialButtonText, { color: Colors[theme].text }]}>
            Continue with Google
          </Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={[styles.registerText, { color: Colors[theme].textSecondary }]}>
            Don&apos;t have an account?
          </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={[styles.registerLink, { color: Colors[theme].primary }]}>
                Sign up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    marginTop: 16,
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
  },
  formContainer: {
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      }
    }),
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-Regular',
  },
  errorText: {
    color: '#E53935',
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: 16,
    fontFamily: 'Poppins-Regular',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  socialButtonText: {
    marginLeft: 8,
    fontFamily: 'Poppins-Medium',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerText: {
    fontFamily: 'Poppins-Regular',
  },
  registerLink: {
    marginLeft: 8,
    fontFamily: 'Poppins-SemiBold',
  },
});
