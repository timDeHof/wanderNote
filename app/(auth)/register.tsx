import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import Colors from '@/utils/colors';
import { Lock, Mail, User, ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Button from '@/components/ui/Button';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signUp, loading } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    try {
      await signUp(name, email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: Colors[theme].background }
      ]}
    >
      <Animated.View
        entering={FadeIn.duration(500)}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Colors[theme].text} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        entering={FadeIn.duration(800).delay(200)}
        style={[
          styles.formContainer,
          { backgroundColor: Colors[theme].card }
        ]}
      >
        <Text style={[styles.title, { color: Colors[theme].text }]}>
          Create Account
        </Text>

        <View style={styles.inputContainer}>
          <User size={20} color={Colors[theme].textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[
              styles.input,
              {
                color: Colors[theme].text,
                borderColor: Colors[theme].border
              }
            ]}
            placeholder="Full Name"
            placeholderTextColor={Colors[theme].textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

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
            placeholder="Confirm Password"
            placeholderTextColor={Colors[theme].textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <Button
          title="Create Account"
          onPress={handleRegister}
          isLoading={loading}
          style={{ marginTop: 24 }}
        />

        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: Colors[theme].textSecondary }]}>
            Already have an account?
          </Text>
          <Link href="./login" asChild>
            <TouchableOpacity>
              <Text style={[styles.loginLink, { color: Colors[theme].primary }]}>
                Log in
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
    flexGrow: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontFamily: 'Poppins-Regular',
  },
  loginLink: {
    marginLeft: 8,
    fontFamily: 'Poppins-SemiBold',
  },
});
