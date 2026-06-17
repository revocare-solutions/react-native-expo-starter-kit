import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import GorhomBottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetProps as GorhomProps,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  title?: string;
  onClose?: () => void;
  enableDynamicSizing?: boolean;
}

export const BottomSheet = forwardRef<GorhomBottomSheet, BottomSheetProps>(
  ({ children, snapPoints: snapPointsProp, title, onClose, enableDynamicSizing = true }, ref) => {
    const snapPoints = useMemo(() => snapPointsProp ?? ['25%', '50%'], [snapPointsProp]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      ),
      [],
    );

    const sheetProps: Partial<GorhomProps> = enableDynamicSizing
      ? { enableDynamicSizing }
      : { snapPoints };

    return (
      <GorhomBottomSheet
        ref={ref}
        index={-1}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#9ca3af' }}
        backgroundStyle={{ backgroundColor: 'white' }}
        onChange={(index) => {
          if (index === -1) onClose?.();
        }}
        {...sheetProps}
      >
        <BottomSheetView className="px-4 pb-8">
          {title && (
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">{title}</Text>
              {onClose && (
                <Pressable onPress={onClose} className="p-1">
                  <Text className="text-gray-400 text-lg">✕</Text>
                </Pressable>
              )}
            </View>
          )}
          {children}
        </BottomSheetView>
      </GorhomBottomSheet>
    );
  },
);

BottomSheet.displayName = 'BottomSheet';

export { default as GorhomBottomSheet } from '@gorhom/bottom-sheet';
