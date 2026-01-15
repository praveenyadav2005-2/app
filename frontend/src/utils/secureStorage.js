/**
 * Secure Storage Utility
 * Encrypts/decrypts localStorage data using username-based key
 * This prevents casual tampering with game state
 */

// Simple but effective encryption using XOR with a derived key
// For production, consider using Web Crypto API with AES-GCM

const SALT = 'EnigmaGame2026!@#$'; // Add complexity to the key

/**
 * Derive an encryption key from username
 */
const deriveKey = (username) => {
  if (!username) return SALT;
  // Create a longer key by combining username with salt
  let key = '';
  const combined = username + SALT + username.split('').reverse().join('');
  for (let i = 0; i < 256; i++) {
    key += combined.charAt(i % combined.length);
  }
  return key;
};

/**
 * Encrypt a string using XOR cipher with the derived key
 */
const encrypt = (data, key) => {
  if (!data) return '';
  let result = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  // Convert to base64 for safe storage
  return btoa(unescape(encodeURIComponent(result)));
};

/**
 * Decrypt a string using XOR cipher with the derived key
 */
const decrypt = (encryptedData, key) => {
  if (!encryptedData) return '';
  try {
    // Decode from base64
    const data = decodeURIComponent(escape(atob(encryptedData)));
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (e) {
    console.error('Decryption failed:', e);
    return '';
  }
};

/**
 * Add integrity check (simple hash)
 */
const computeChecksum = (data, username) => {
  let hash = 0;
  const str = data + username + SALT;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Secure Storage API
 */
const SecureStorage = {
  /**
   * Set an encrypted item in localStorage
   */
  setItem: (key, value, username) => {
    try {
      const derivedKey = deriveKey(username);
      const jsonData = JSON.stringify(value);
      const checksum = computeChecksum(jsonData, username);
      const dataWithChecksum = JSON.stringify({ data: jsonData, checksum });
      const encrypted = encrypt(dataWithChecksum, derivedKey);
      localStorage.setItem(key, encrypted);
      return true;
    } catch (e) {
      console.error('SecureStorage.setItem failed:', e);
      return false;
    }
  },

  /**
   * Get and decrypt an item from localStorage
   * Handles legacy unencrypted data gracefully
   */
  getItem: (key, username) => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      
      // Try to detect if this is old unencrypted JSON data
      // Old data would start with '{' or '[' (JSON)
      if (stored.startsWith('{') || stored.startsWith('[')) {
        console.log('📦 [SecureStorage] Found legacy unencrypted data, migrating...');
        try {
          const legacyData = JSON.parse(stored);
          // Migrate to encrypted storage
          SecureStorage.setItem(key, legacyData, username);
          console.log('✅ [SecureStorage] Legacy data migrated successfully');
          return legacyData;
        } catch (parseError) {
          console.error('Failed to parse legacy data:', parseError);
          localStorage.removeItem(key);
          return null;
        }
      }
      
      // Try to decrypt
      const derivedKey = deriveKey(username);
      const decrypted = decrypt(stored, derivedKey);
      if (!decrypted) {
        // Decryption failed - data may be corrupted or from different user
        console.warn('⚠️ [SecureStorage] Decryption failed, clearing invalid data');
        localStorage.removeItem(key);
        return null;
      }
      
      const parsed = JSON.parse(decrypted);
      const { data, checksum } = parsed;
      
      // Verify integrity
      const expectedChecksum = computeChecksum(data, username);
      if (checksum !== expectedChecksum) {
        console.warn('⚠️ [SecureStorage] Data integrity check failed - possible tampering detected');
        localStorage.removeItem(key);
        return null; // Data was tampered with
      }
      
      return JSON.parse(data);
    } catch (e) {
      console.error('SecureStorage.getItem failed:', e);
      // Clear corrupted data
      localStorage.removeItem(key);
      return null;
    }
  },

  /**
   * Remove an item from localStorage
   */
  removeItem: (key) => {
    localStorage.removeItem(key);
  },

  /**
   * Check if an item exists and is valid
   */
  hasValidItem: (key, username) => {
    const item = SecureStorage.getItem(key, username);
    return item !== null;
  },

  /**
   * Clear all game-related encrypted data for a user
   */
  clearUserData: (username) => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('gameState_') || key.includes('answeredQuestions_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
};

export default SecureStorage;
