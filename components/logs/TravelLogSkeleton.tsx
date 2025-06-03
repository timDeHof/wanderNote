import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import Colors from '@/utils/colors';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withRepeat, 
  withTiming, 
  cancelAnimation, 
  useAnimatedReaction
} from 'react-native-reanimated';

const TravelLogSkeleton = () => {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.5);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );

    return () => {
      cancelAnimation(opacity);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[theme].card }
      ]}
    >
      <Animated.View 
        style={[
          styles.image,
          { backgroundColor: Colors[theme].border },
          animatedStyle
        ]}
      />
      
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.title,
            { backgroundColor: Colors[theme].border },
            animatedStyle
          ]}
        />
        
        <View style={styles.meta}>
          <Animated.View 
            style={[
              styles.location,
              { backgroundColor: Colors[theme].border },
              animatedStyle
            ]}
          />
          
          <Animated.View 
            style={[
              styles.date,
              { backgroundColor: Colors[theme].border },
              animatedStyle
            ]}
          />
        </View>
        
        <Animated.View 
          style={[
            styles.rating,
            { backgroundColor: Colors[theme].border },
            animatedStyle
          ]}
        />
        
        <View style={styles.tags}>
          <Animated.View 
            style={[
              styles.tag,
              { backgroundColor: Colors[theme].border },
              animatedStyle
            ]}
          />
          
          <Animated.View 
            style={[
              styles.tag,
              { backgroundColor: Colors[theme].border },
              animatedStyle
            ]}
          />
          
          <Animated.View 
            style={[
              styles.tag,
              { backgroundColor: Colors[theme].border },
              animatedStyle
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 16,
  },
  title: {
    height: 24,
    borderRadius: 4,
    marginBottom: 12,
    width: '70%',
  },
  meta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  location: {
    height: 16,
    width: '40%',
    borderRadius: 4,
    marginRight: 16,
  },
  date: {
    height: 16,
    width: '25%',
    borderRadius: 4,
  },
  rating: {
    height: 16,
    width: '30%',
    borderRadius: 4,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
  },
  tag: {
    height: 24,
    width: 60,
    borderRadius: 12,
    marginRight: 8,
  },
});

export default TravelLogSkeleton;