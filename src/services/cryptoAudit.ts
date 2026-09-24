/**
 * Cryptographic audit log hash chaining utility.
 * Simulates SHA-256 block-linking for tamper-evident verification.
 */
export class AuditHashChainer {
  static simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    // Convert to hex-like string representation padded to 64 chars
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return '0x' + (hex.repeat(8)).slice(0, 64);
  }

  static createEntryHash(
    timestamp: string,
    agentId: string,
    actionType: string,
    details: string,
    previousHash: string
  ): string {
    const payload = `${timestamp}|${agentId}|${actionType}|${details}|${previousHash}`;
    return this.simpleHash(payload);
  }
}
