import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from '@expo-google-fonts/ibm-plex-sans';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';

/**
 * Maps font family names (as defined in theme presets) to the font assets
 * that need to be loaded via useFonts(). The keys in each inner record
 * become the font names available to fontFamily in styles.
 */
export const FONT_MAP: Record<string, Record<string, number>> = {
  Inter: {
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  },
  'Plus Jakarta Sans': {
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  },
  'IBM Plex Sans': {
    IBMPlexSans_400Regular,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
  },
  'JetBrains Mono': {
    JetBrainsMono_400Regular,
  },
};
