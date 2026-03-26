import { commands } from './registry';
import type { CommandDefinition } from './registry';
import type { Manifest } from '../generator';

export function getAvailableCommands(
  selectedCommandIds: string[],
  selectedFeatures: Record<string, string>,
  manifest: Manifest,
): CommandDefinition[] {
  return commands.filter((cmd) => {
    if (!selectedCommandIds.includes(cmd.id)) return false;
    if (cmd.condition && !cmd.condition(selectedFeatures, manifest)) return false;
    return true;
  });
}
