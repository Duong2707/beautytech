import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

type Props = {
  onPress?: () => void;
};

export default function SplashScreen({ onPress }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Animated.Image
        source={require('../../../assets/logo.png')}
        style={[
          styles.logo,
          { opacity, transform: [{ scale }] },
        ]}
        resizeMode="contain"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.375,
    height: width * 0.375 * (96.54 / 147),
  },
});