import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  FlatList,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingStore } from '../store/onboardingStore';
import { Button } from '../components/ui';
import { colors, typography, borderRadius, spacing } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  description: string;
  gradient: [string, string];
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'scan-outline',
    title: 'Scan',
    subtitle: 'Any Room',
    description: 'Point your camera at furniture and let AI identify each piece instantly.',
    gradient: ['#F8F6F4', '#EDE8E3'],
  },
  {
    id: '2',
    icon: 'sparkles-outline',
    title: 'Discover',
    subtitle: 'Perfect Matches',
    description: 'Get curated product recommendations from top retailers worldwide.',
    gradient: ['#F4F6F8', '#E3E8ED'],
  },
  {
    id: '3',
    icon: 'bookmark-outline',
    title: 'Save',
    subtitle: '& Organize',
    description: 'Create rooms and build your dream space one piece at a time.',
    gradient: ['#F6F8F4', '#E8EDE3'],
  },
];

export default function OnboardingScreen() {
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        <LinearGradient colors={item.gradient} style={styles.gradientBg}>
          <Animated.View style={[styles.iconWrapper, { transform: [{ scale }], opacity }]}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={48} color={colors.accent[500]} />
            </View>
          </Animated.View>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const renderPagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => {
        const inputRange = [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ];

        const width = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const bgColor = scrollX.interpolate({
          inputRange,
          outputRange: [colors.neutral[200], colors.text.primary, colors.neutral[200]],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[styles.dot, { width, backgroundColor: bgColor }]}
          />
        );
      })}
    </View>
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      {!isLastSlide && (
        <TouchableOpacity style={styles.skipContainer} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {renderPagination()}

      <View style={styles.footer}>
        <Button
          title={isLastSlide ? 'Get Started' : 'Continue'}
          variant="primary"
          size="large"
          fullWidth
          onPress={handleNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: spacing[5],
    zIndex: 10,
    padding: spacing[2],
  },
  skipText: {
    ...typography.label,
    color: colors.text.secondary,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  gradientBg: {
    height: SCREEN_HEIGHT * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
  },
  title: {
    ...typography.displayMedium,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.displayMedium,
    color: colors.accent[500],
    marginBottom: spacing[4],
  },
  description: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    lineHeight: 28,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingHorizontal: spacing[6],
    paddingBottom: 40,
  },
});
