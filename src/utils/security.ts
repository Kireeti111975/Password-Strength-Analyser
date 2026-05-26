/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PasswordAnalysis, PasswordStrength } from "../types";

// Common weak / compromised passwords to check locally
const COMMON_DICTIONARY = [
  "password", "123456", "123456789", "12345", "12345678", "1234", "qwerty", 
  "password123", "admin", "admin123", "welcome", "letmein", "superman", "iloveyou",
  "secret", "shadow", "hacker", "hunter2", "login", "oracle", "cisco", "security",
  "google", "microsoft", "guest", "default", "root", "master", "football"
];

// Continuous keyboard sequences
const KEYBOARD_SEQUENCES = [
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
  "1234567890",
  "abcdefghijklmnopqrstuvwxyz"
];

/**
 * Custom base-2 logarithm helper
 */
function log2(num: number): number {
  return Math.log(num) / Math.LN2;
}

/**
 * Calculates entropy and performs deep security scanning on a string
 */
export function analyzePassword(password: string): PasswordAnalysis {
  if (!password) {
    return {
      score: 0,
      strength: 'weak',
      entropy: 0,
      crackTimeLabel: "instant",
      complexity: {
        hasUppercase: false,
        hasLowercase: false,
        hasNumbers: false,
        hasSymbols: false,
      },
      length: 0,
      warnings: ["Password is empty"],
      suggestions: ["Type a password into the input field above to start the risk assessment."],
      hasRepeatedChars: false,
      hasSequentialLetters: false,
      hasSequentialNumbers: false,
      hasPredictableSubstitutions: false,
      hasCommonWord: false
    };
  }

  const length = password.length;
  
  // 1. Complexity assessments
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  // Special symbols list matching basic ASCII printable characters
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  let poolSize = 0;
  if (hasLowercase) poolSize += 26;
  if (hasUppercase) poolSize += 26;
  if (hasNumbers) poolSize += 10;
  if (hasSymbols) poolSize += 33; // ~33 generic symbols

  // Base raw entropy: L * log2(poolSize)
  let entropy = length * (poolSize > 0 ? log2(poolSize) : 0);

  // 2. Perform advanced cybersecurity checks and apply entropy penalties
  const lowercaseVal = password.toLowerCase();
  
  // check A: Repeated characters (e.g., "aaaa", "111")
  let repeatCount = 0;
  for (let i = 0; i < length - 1; i++) {
    if (password[i] === password[i+1]) {
      repeatCount++;
    }
  }
  const hasRepeatedChars = repeatCount >= 2;
  if (hasRepeatedChars) {
    entropy -= (repeatCount * 4); // penalty for repeats
  }

  // check B: Sequential patterns (e.g., "abcd", "1234", "qwert")
  let hasSequentialLetters = false;
  let hasSequentialNumbers = false;

  for (let i = 0; i < length - 3; i++) {
    const chunk = lowercaseVal.substring(i, i + 4);
    for (const seq of KEYBOARD_SEQUENCES) {
      if (seq.includes(chunk)) {
        if (/[0-9]/.test(chunk)) {
          hasSequentialNumbers = true;
        } else {
          hasSequentialLetters = true;
        }
      }
    }
    // Check ASCII-based sequential increments (e.g. abcde)
    const code0 = password.charCodeAt(i);
    const code1 = password.charCodeAt(i + 1);
    const code2 = password.charCodeAt(i + 2);
    const code3 = password.charCodeAt(i + 3);
    if (code1 === code0 + 1 && code2 === code1 + 1 && code3 === code2 + 1) {
      hasSequentialLetters = true;
    }
  }

  if (hasSequentialLetters) entropy -= 12;
  if (hasSequentialNumbers) entropy -= 12;

  // check C: Predictable substitutions (e.g., replacing a with @, e with 3, s with $)
  // Check if both letters and their predictable symbols coexist (e.g., "p@ssword", "s3cur3")
  const hasPredictableSubstitutions = (
    (lowercaseVal.includes('a') && password.includes('@')) ||
    (lowercaseVal.includes('s') && (password.includes('$') || password.includes('5'))) ||
    (lowercaseVal.includes('e') && password.includes('3')) ||
    (lowercaseVal.includes('o') && password.includes('0')) ||
    (lowercaseVal.includes('i') && (password.includes('1') || password.includes('!')))
  );
  if (hasPredictableSubstitutions) {
    entropy -= 8;
  }

  // check D: Common dictionary checking
  let hasCommonWord = false;
  for (const word of COMMON_DICTIONARY) {
    if (lowercaseVal === word || lowercaseVal.includes(word) && word.length >= 4) {
      hasCommonWord = true;
      entropy -= 18;
      break;
    }
  }

  // Normalize entropy to a lower bound of 0
  entropy = Math.max(0, parseFloat(entropy.toFixed(2)));

  // 3. Crack time calculations
  // Assuming a professional GPU cluster or custom ASIC hashing 10 billion keys per second
  const GUESSES_PER_SECOND = 10_000_000_000; 
  const totalCombinations = Math.pow(2, entropy);
  const timeInSeconds = totalCombinations / GUESSES_PER_SECOND;

  let crackTimeLabel = "";
  if (timeInSeconds < 0.01) {
    crackTimeLabel = "Instant (milliseconds)";
  } else if (timeInSeconds < 1) {
    crackTimeLabel = "Under 1 second";
  } else if (timeInSeconds < 60) {
    crackTimeLabel = `${Math.ceil(timeInSeconds)} second${Math.ceil(timeInSeconds) > 1 ? 's' : ''}`;
  } else if (timeInSeconds < 3600) {
    const mins = Math.ceil(timeInSeconds / 60);
    crackTimeLabel = `${mins} minute${mins > 1 ? 's' : ''}`;
  } else if (timeInSeconds < 86400) {
    const hrs = Math.ceil(timeInSeconds / 3600);
    crackTimeLabel = `${hrs} hour${hrs > 1 ? 's' : ''}`;
  } else if (timeInSeconds < 2592000) {
    const days = Math.ceil(timeInSeconds / 86400);
    crackTimeLabel = `${days} day${days > 1 ? 's' : ''}`;
  } else if (timeInSeconds < 31536000) {
    const mons = Math.ceil(timeInSeconds / 2592000);
    crackTimeLabel = `${mons} month${mons > 1 ? 's' : ''}`;
  } else if (timeInSeconds < 3153600000) {
    const yrs = Math.ceil(timeInSeconds / 31536000);
    crackTimeLabel = `${yrs.toLocaleString()} year${yrs > 1 ? 's' : ''}`;
  } else if (timeInSeconds < 315360000000) {
    const centuries = Math.ceil(timeInSeconds / 3153600000);
    crackTimeLabel = `${centuries.toLocaleString()} centur${centuries > 1 ? 'ies' : 'y'}`;
  } else {
    crackTimeLabel = "Trillions of centuries (virtually unbreakable)";
  }

  // 4. Generate dynamic security score and rating
  // Scale score primarily off entropy (0 is weakest, 100+ is exceptionally secure)
  // Max sensible entropy for a human pass-phrase is around 120 bits.
  let score = Math.min(100, Math.round((entropy / 85) * 100));
  
  // Adjust score based on lengths and complexities to safeguard user expectations
  if (length < 6) {
    score = Math.min(score, 15); // Hard cap for extremely short inputs
  } else if (length < 8) {
    score = Math.min(score, 35); // Hard cap for sub-standard lengths
  } else if (length < 12 && score > 80) {
    score = 80; // Limit score unless it's genuinely long
  }

  if (score < 0) score = 0;

  let strength: PasswordStrength = 'weak';
  if (score >= 80) {
    strength = 'very-strong';
  } else if (score >= 60) {
    strength = 'strong';
  } else if (score >= 35) {
    strength = 'moderate';
  }

  // 5. Generate action recommendations (Checklist Warnings and Suggestions)
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Warnings
  if (length < 8) {
    warnings.push("Password length is critically low");
  } else if (length < 12) {
    warnings.push("Standard length could be improved for enterprise protection");
  }

  if (hasCommonWord) {
    warnings.push("Contains common dictionary words or compromised values");
  }
  if (hasRepeatedChars) {
    warnings.push("Repetitive characters detected");
  }
  if (hasSequentialLetters || hasSequentialNumbers) {
    warnings.push("Sequential keyboard slide patterns detected");
  }
  if (hasPredictableSubstitutions) {
    warnings.push("Simple symbol substitutions (like @ for a) are easily pattern-hacked");
  }

  const coreComplexityCount = 
    (hasUppercase ? 1 : 0) + 
    (hasLowercase ? 1 : 0) + 
    (hasNumbers ? 1 : 0) + 
    (hasSymbols ? 1 : 0);

  if (coreComplexityCount < 3) {
    warnings.push("Lacks character diversity (requires mixed parameters)");
  }

  // Recommendations
  if (length < 14) {
    suggestions.push(`Increase overall character length to 14 or above to increase bits of entropy exponential-fold.`);
  }
  if (!hasUppercase) {
    suggestions.push("Inject one or more uppercase capital characters (A-Z).");
  }
  if (!hasLowercase) {
    suggestions.push("Inject one or more lowercase characters (a-z).");
  }
  if (!hasNumbers) {
    suggestions.push("Incorporate mathematical numbers (0-9).");
  }
  if (!hasSymbols) {
    suggestions.push("Incorporate security characters or symbols (e.g. #, $, %, @, +, &).");
  }
  if (hasRepeatedChars || hasSequentialLetters || hasSequentialNumbers) {
    suggestions.push("Randomize individual placements to bypass structured sequence algorithm dictionaries.");
  }
  if (hasCommonWord) {
    suggestions.push("Do not use proper nouns or names. Formulate strings using uncommon word collages (Diceware passphrases).");
  }

  // If password is exceptional, show a clean checklist success indicator
  if (warnings.length === 0) {
    suggestions.push("Optimal structure! Your password exceeds standard military-grade complexity benchmarks.");
  }

  return {
    score,
    strength,
    entropy,
    crackTimeLabel,
    complexity: {
      hasUppercase,
      hasLowercase,
      hasNumbers,
      hasSymbols,
    },
    length,
    warnings,
    suggestions,
    hasRepeatedChars,
    hasSequentialLetters,
    hasSequentialNumbers,
    hasPredictableSubstitutions,
    hasCommonWord,
  };
}

/**
 * Automagically transforms a weak password or base phrase into 3 creative strong variations
 */
export function generateUpgradedAlternatives(password: string): string[] {
  if (!password) return [];

  const alternatives: string[] = [];
  const trimmed = password.trim();

  // Variant 1: L33t Speak Substitution + Symbol suffix
  let v1 = trimmed
    .replace(/[aA]/g, "@")
    .replace(/[sS]/g, "$")
    .replace(/[oO]/g, "0")
    .replace(/[iI]/g, "1")
    .replace(/[eE]/g, "3");
  
  // Make sure first is capitalized
  if (v1.length > 0) {
    v1 = v1.charAt(0).toUpperCase() + v1.slice(1);
  }
  v1 += "_Sec!9X";
  if (v1 !== password) alternatives.push(v1);

  // Variant 2: Secure Prefix/Suffix salt injection
  const capitalBase = trimmed.split("").map((ch, idx) => idx % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()).join("");
  const v2 = `Shield#${capitalBase}$2026`;
  if (v2 !== password) alternatives.push(v2);

  // Variant 3: Diceware style passphrase using components of input + random words
  const SEC_WORDS = ["Krypton", "Armor", "Cipher", "Fortress", "Nexus", "Sentinel", "Protocol", "Quantum"];
  const randWord1 = SEC_WORDS[Math.floor(Math.random() * SEC_WORDS.length)];
  const randWord2 = SEC_WORDS[Math.floor(Math.random() * SEC_WORDS.length)];
  const cleanBase = trimmed.replace(/[^A-Za-z0-9]/g, "");
  const v3 = `${randWord1}-${cleanBase ? cleanBase.slice(0, 6) : "Lock"}-${randWord2}#88`;
  if (v3 !== password) alternatives.push(v3);

  // Ensure unique returned records (up to 3)
  return Array.from(new Set(alternatives)).slice(0, 3);
}

/**
 * Procedural random password creator based on policy parameters
 */
export function generateStrongPassword(settings: {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}): string {
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numberChars = "0123456789";
  const symbolChars = "!@#$%^&*()_+-=[]{}|;:,.<>?~/";

  let availablePool = "";
  const mandatoryPicks: string[] = [];

  if (settings.includeLowercase) {
    availablePool += lowercaseChars;
    mandatoryPicks.push(lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)]);
  }
  if (settings.includeUppercase) {
    availablePool += uppercaseChars;
    mandatoryPicks.push(uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)]);
  }
  if (settings.includeNumbers) {
    availablePool += numberChars;
    mandatoryPicks.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
  }
  if (settings.includeSymbols) {
    availablePool += symbolChars;
    mandatoryPicks.push(symbolChars[Math.floor(Math.random() * symbolChars.length)]);
  }

  // Fallback if user toggles everything off
  if (availablePool.length === 0) {
    availablePool = lowercaseChars + numberChars;
    mandatoryPicks.push(lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)]);
  }

  const resultChars: string[] = [...mandatoryPicks];
  const remainingLength = settings.length - resultChars.length;

  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = Math.floor(Math.random() * availablePool.length);
    resultChars.push(availablePool[randomIndex]);
  }

  // Shuffle our output character array to make starting characters secure too
  for (let i = resultChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultChars[i], resultChars[j]] = [resultChars[j], resultChars[i]];
  }

  return resultChars.join("");
}
