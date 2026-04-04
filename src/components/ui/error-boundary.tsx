import React, { Component, type ErrorInfo, type PropsWithChildren } from 'react';
import { View, Text, Pressable } from 'react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 px-6">
          <Text className="text-5xl mb-4">💥</Text>
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Something went wrong
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </Text>
          <Pressable
            className="bg-blue-600 rounded-lg px-6 py-3 active:bg-blue-700"
            onPress={this.handleReset}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
