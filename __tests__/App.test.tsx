/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-native-url-polyfill/auto', () => {});
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaConsumer: ({ children }: any) => children(inset),
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => inset,
  };
});

import App from '../App';

test('renders correctly', async () => {
  jest.useFakeTimers();
  let root: any;
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(<App />);
  });
  expect(root).toBeDefined();
  await ReactTestRenderer.act(async () => {
    jest.clearAllTimers();
  });
  jest.useRealTimers();
});
