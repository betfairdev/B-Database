import { Injectable } from '@nestjs/common';
import { DataRow } from '../../entities/data-row.entity';

interface ConflictData {
  payload: Record<string, any>;
  versionVector: Record<string, number>;
}

@Injectable()
export class ConflictResolverService {
  hasConflict(
    existingVersionVector: Record<string, number>,
    incomingVersionVector: Record<string, number>,
  ): boolean {
    if (!existingVersionVector || !incomingVersionVector) {
      return false;
    }

    // Check if vectors are concurrent (neither dominates the other)
    let existingDominates = false;
    let incomingDominates = false;

    const allClients = new Set([
      ...Object.keys(existingVersionVector),
      ...Object.keys(incomingVersionVector),
    ]);

    for (const clientId of allClients) {
      const existingVersion = existingVersionVector[clientId] || 0;
      const incomingVersion = incomingVersionVector[clientId] || 0;

      if (existingVersion > incomingVersion) {
        existingDominates = true;
      } else if (incomingVersion > existingVersion) {
        incomingDominates = true;
      }
    }

    // Conflict exists if both vectors have some dominance (concurrent updates)
    return existingDominates && incomingDominates;
  }

  async resolveConflict(
    existingRow: DataRow,
    incomingData: ConflictData,
    tableId: string,
  ): Promise<Record<string, any>> {
    // Default strategy: Last Writer Wins (LWW) based on updatedAt timestamp
    // In a real implementation, you might want to:
    // 1. Load table-specific merge strategies
    // 2. Apply field-level merge rules
    // 3. Use custom merge hooks

    // For now, we'll use a simple field-level merge strategy
    return this.mergePayloads(existingRow.payload, incomingData.payload, existingRow.updatedAt);
  }

  private mergePayloads(
    existingPayload: Record<string, any>,
    incomingPayload: Record<string, any>,
    existingTimestamp: Date,
  ): Record<string, any> {
    const merged = { ...existingPayload };

    // Example custom merge hook for a specific table
    if (this.isContactTable(existingPayload)) {
      return this.mergeContactData(existingPayload, incomingPayload);
    }

    // Default field-level merge
    for (const [key, value] of Object.entries(incomingPayload)) {
      if (key === 'updatedAt') {
        // Always use the latest timestamp
        const incomingTimestamp = new Date(value);
        merged[key] = incomingTimestamp > existingTimestamp ? value : merged[key];
      } else if (typeof value === 'string' && value.length > (merged[key]?.length || 0)) {
        // For strings, prefer the longer value (more information)
        merged[key] = value;
      } else if (typeof value === 'number' && value > (merged[key] || 0)) {
        // For numbers, prefer the larger value
        merged[key] = value;
      } else if (Array.isArray(value) && Array.isArray(merged[key])) {
        // For arrays, merge and deduplicate
        merged[key] = [...new Set([...merged[key], ...value])];
      } else if (typeof value === 'object' && value !== null && typeof merged[key] === 'object' && merged[key] !== null) {
        // For objects, recursively merge
        merged[key] = { ...merged[key], ...value };
      } else if (merged[key] === undefined || merged[key] === null) {
        // If existing value is null/undefined, use incoming value
        merged[key] = value;
      }
      // Otherwise, keep existing value (first writer wins for this field)
    }

    return merged;
  }

  private isContactTable(payload: Record<string, any>): boolean {
    // Example: detect if this is a contact record based on payload structure
    return payload.hasOwnProperty('firstName') && payload.hasOwnProperty('lastName');
  }

  private mergeContactData(
    existingPayload: Record<string, any>,
    incomingPayload: Record<string, any>,
  ): Record<string, any> {
    // Example custom merge logic for contact data
    const merged = { ...existingPayload };

    // Merge contact information with specific rules
    if (incomingPayload.firstName && incomingPayload.firstName.trim()) {
      merged.firstName = incomingPayload.firstName;
    }

    if (incomingPayload.lastName && incomingPayload.lastName.trim()) {
      merged.lastName = incomingPayload.lastName;
    }

    // For email, prefer the one that looks more complete
    if (incomingPayload.email && incomingPayload.email.includes('@')) {
      if (!merged.email || !merged.email.includes('@')) {
        merged.email = incomingPayload.email;
      }
    }

    // Merge phone numbers (keep both if different)
    if (incomingPayload.phone && incomingPayload.phone !== merged.phone) {
      merged.alternatePhone = merged.phone;
      merged.phone = incomingPayload.phone;
    }

    // Merge tags/categories
    if (Array.isArray(incomingPayload.tags) && Array.isArray(merged.tags)) {
      merged.tags = [...new Set([...merged.tags, ...incomingPayload.tags])];
    } else if (Array.isArray(incomingPayload.tags)) {
      merged.tags = incomingPayload.tags;
    }

    return merged;
  }
}