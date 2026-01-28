import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingStore } from '../store/onboardingStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  description: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'home',
    iconColor: '#007AFF',
    title: 'Welcome to RoomRadar',
    description:
      'Discover furniture you love by simply taking a photo. Our AI identifies pieces and finds where to buy them.',
  },
  {
    id: '2',
    icon: 'camera',
    iconColor: '#34C759',
    title: 'Scan Any Room',
    description:
      'Point your camera at any furniture piece or room. Our AI will detect and identify each item automatically.',
  },
  {
    id: '3',
    icon: 'cart',
    iconColor: '#FF9500',
    title: 'Shop Matching Products',
    description:
      'Get instant product matches from top retailers. Compare prices and find the best deals on furniture you love.',
  },
  {
    id: '4',
    icon: 'bookmark',
    iconColor: '#AF52DE',
    title: 'Save & Organize',
    description:
      'Create rooms to organize your favorite finds. Build your dream space one piece at a time.',
  },
];

export default function OnboardingScreen() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={[styles.iconContainer, { backgroundColor: `${item.iconColor}15` }]}>
        <Ionicons name={item.icon} size={80} color={item.iconColor} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {!isLastSlide && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {renderPagination()}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isLastSlide && styles.buttonGetStarted]}
          onPress={handleNext}
        >
          <Text style={[styles.buttonText, isLastSlide && styles.buttonTextGetStarted]}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
          {!isLastSlide && (
            <Ionicons name="arrow-forward" size={20} color="#007AFF" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 17,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: '#007AFF',
    width: 24,
  },
  dotInactive: {
    backgroundColor: '#D1D1D6',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    gap: 8,
  },
  buttonGetStarted: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  buttonTextGetStarted: {
    color: '#fff',
  },
});
