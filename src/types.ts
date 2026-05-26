/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PasswordStrength = 'weak' | 'moderate' | 'strong' | 'very-strong';

export interface CharacterComplexity {
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
}

export interface PasswordAnalysis {
  score: number; // 0 - 100
  strength: PasswordStrength;
  entropy: number; // in bits
  crackTimeLabel: string;
  complexity: CharacterComplexity;
  length: number;
  warnings: string[];
  suggestions: string[];
  hasRepeatedChars: boolean;
  hasSequentialLetters: boolean;
  hasSequentialNumbers: boolean;
  hasPredictableSubstitutions: boolean;
  hasCommonWord: boolean;
}

export interface GeneratorSettings {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

export interface VerificationResult {
  pwned: boolean;
  breachCount: number;
  reuseDetected: boolean;
  hash: string;
}

