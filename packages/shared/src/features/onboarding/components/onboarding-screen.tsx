import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, useWindowDimensions } from 'react-native';
import { OnboardingPage } from './onboarding-page';
import { useOnboarding } from '../hooks/use-onboarding';

const PAGES = [
  { title: 'Welcome', description: 'Get started with your new app.', icon: '\uD83D\uDC4B' },
  { title: 'Discover', description: 'Explore features built for you.', icon: '\uD83D\uDD0D' },
  { title: 'Ready', description: "You are all set. Let's go!", icon: '\uD83D\uDE80' },
];

export function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const { complete } = useOnboarding();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLastPage = currentIndex === PAGES.length - 1;

  const handleNext = () => {
    if (isLastPage) {
      complete();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <FlatList
        ref={flatListRef}
        data={PAGES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <OnboardingPage {...item} />
          </View>
        )}
        keyExtractor={(_, i) => i.toString()}
      />
      {/* Pagination dots */}
      <View className="flex-row justify-center mb-4">
        {PAGES.map((_, i) => (
          <View
            key={i}
            className={`w-2 h-2 rounded-full mx-1 ${i === currentIndex ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          />
        ))}
      </View>
      {/* Buttons */}
      <View className="flex-row justify-between px-8 pb-12">
        <Pressable onPress={complete}>
          <Text className="text-base text-gray-500">Skip</Text>
        </Pressable>
        <Pressable onPress={handleNext} className="bg-blue-500 px-6 py-3 rounded-full">
          <Text className="text-white text-base font-semibold">
            {isLastPage ? 'Get Started' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
