import { ConflictInfo, ConflictResolutionStrategy } from '../types';

export class ConflictService {
  private strategy: ConflictResolutionStrategy;
  private customResolver?: (conflict: ConflictInfo) => Promise<'local' | 'remote' | 'merge' | 'skip'>;

  constructor(strategy: ConflictResolutionStrategy = 'last-write-wins') {
    this.strategy = strategy;
  }

  setCustomResolver(resolver: (conflict: ConflictInfo) => Promise<'local' | 'remote' | 'merge' | 'skip'>): void {
    this.customResolver = resolver;
  }

  async resolveConflict(conflict: ConflictInfo): Promise<ConflictInfo> {
    let resolution: 'local' | 'remote' | 'merge' | 'skip';

    switch (this.strategy) {
      case 'last-write-wins':
        resolution = 'remote'; // Assume remote is newer
        break;
      
      case 'manual':
        resolution = 'skip'; // Require manual resolution
        break;
      
      case 'custom':
        if (this.customResolver) {
          resolution = await this.customResolver(conflict);
        } else {
          resolution = 'skip';
        }
        break;
      
      default:
        resolution = 'skip';
    }

    return {
      ...conflict,
      resolution
    };
  }

  async resolveConflicts(conflicts: ConflictInfo[]): Promise<ConflictInfo[]> {
    const resolved: ConflictInfo[] = [];
    
    for (const conflict of conflicts) {
      const resolvedConflict = await this.resolveConflict(conflict);
      resolved.push(resolvedConflict);
    }

    return resolved;
  }

  mergeValues(localValue: any, remoteValue: any, field: string): any {
    // Simple merge strategy - this could be made more sophisticated
    if (typeof localValue === 'object' && typeof remoteValue === 'object') {
      return { ...localValue, ...remoteValue };
    }
    
    if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
      // Merge arrays, removing duplicates
      const merged = [...localValue, ...remoteValue];
      return [...new Set(merged)];
    }

    // For primitive types, prefer remote value (last-write-wins)
    return remoteValue;
  }
}