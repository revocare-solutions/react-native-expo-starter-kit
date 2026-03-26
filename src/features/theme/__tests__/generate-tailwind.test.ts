import { generateTailwindTheme } from '../utils/generate-tailwind';
import { minimalPreset } from '../presets/minimal';

describe('generateTailwindTheme', () => {
  it('should generate color scales', () => {
    const result = generateTailwindTheme(minimalPreset);

    expect(result.colors.primary['500']).toBe('#6366f1');
    expect(result.colors.secondary['500']).toBe('#64748b');
    expect(result.colors.accent['500']).toBe('#10b981');
    expect(result.colors.neutral['500']).toBe('#737373');
  });

  it('should generate semantic colors', () => {
    const result = generateTailwindTheme(minimalPreset);

    expect(result.colors.success).toBe('#22c55e');
    expect(result.colors.warning).toBe('#f59e0b');
    expect(result.colors.error).toBe('#ef4444');
    expect(result.colors.info).toBe('#3b82f6');
  });

  it('should generate border radius values', () => {
    const result = generateTailwindTheme(minimalPreset);

    expect(result.borderRadius.sm).toBe('4px');
    expect(result.borderRadius.md).toBe('8px');
    expect(result.borderRadius.lg).toBe('12px');
  });

  it('should generate spacing scale', () => {
    const result = generateTailwindTheme(minimalPreset);

    expect(result.spacing['1']).toBe('4px');
    expect(result.spacing['2']).toBe('8px');
    expect(result.spacing['4']).toBe('16px');
  });
});
