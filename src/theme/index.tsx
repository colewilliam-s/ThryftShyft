// file for the themes of darkmode and light mode
import { useMemo } from 'react';
import {
	StyleSheet,
	Text as RNText,
	useColorScheme,
	type TextProps,
	type ViewStyle,
	type TextStyle,
	type ImageStyle,
} from 'react-native';

export const lightColors = {
	background: '#ffffff',
	surface: '#efefef',      // thumbnails, cards
	text: '#111111',
	textMuted: '#6b6b6b',
	border: '#e5e5e5',
	primary: '#1f8a0c',
	link: '#0037dd',
	danger: 'red',
	bubbleMine: '#2f6fed',
	bubbleTheirs: '#e6e6e6',
	bubbleTheirsText: '#000000',
};

export type Colors = typeof lightColors;
type Style = ViewStyle | TextStyle | ImageStyle;

export const darkColors: Colors = {
	background: '#121212',
	surface: '#2a2a2a',
	text: '#f2f2f2',
	textMuted: '#a0a0a0',
	border: '#2e2e2e',
	primary: '#3fb62a',
	link: '#6d9bff',
	danger: '#ff6b6b',
	bubbleMine: '#2f6fed',
	bubbleTheirs: '#2e2e2e',
	bubbleTheirsText: '#f2f2f2',
};

export function useTheme() {
	const isDark = useColorScheme() === 'dark';
	return { isDark, colors: isDark ? darkColors : lightColors };
}

// Turns a styles definition into a hook that rebuilds when the theme changes
export function makeStyles<T extends Record<string, Style>>(factory: (colors: Colors) => T) {
	return function useStyles() {
		const { colors } = useTheme();
		return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
	};
}

// Text that defaults to the theme's text color. Without this, plain <Text>
// stays black on a dark background.
export function Text({ style, ...props }: TextProps) {
	const { colors } = useTheme();
	return <RNText {...props} style={[{ color: colors.text }, style]} />;
}
