import type { ThemeConfig } from '@/types';
import { minimalPreset } from '@/features/theme/presets/minimal';

// This file is rewritten by the setup wizard to use the selected preset.
// To change themes, replace the import above with another preset:
//   import { boldPreset as activePreset } from '@/features/theme/presets/bold';
//   import { corporatePreset as activePreset } from '@/features/theme/presets/corporate';

export const themeConfig: ThemeConfig = minimalPreset;
