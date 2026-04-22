/**
 * Usage examples for secure storage, Redux, and logging
 * This file demonstrates how to use all the security features
 */

import { secureLocalStorage, secureSessionStorage } from '../utils/secureStorage';
import { logger } from '../utils/logger';
import { useAppDispatch, useAppSelector } from '../store/hooks';

// ============================================
// Secure Storage Examples
// ============================================

export function secureStorageExamples() {
  // Store a string securely in localStorage
  secureLocalStorage.setItem('userToken', 'my-secret-token-12345');
  // Retrieve the encrypted token
  const token = secureLocalStorage.getItem('userToken');
  logger.info('Token retrieved', { token });

  // Store an object securely in localStorage
  interface UserPreferences {
    theme: 'light' | 'dark';
    notifications: boolean;
  }

  const preferences: UserPreferences = {
    theme: 'dark',
    notifications: true,
  };

  secureLocalStorage.setItemObject('userPreferences', preferences);
  // Retrieve the encrypted preferences
  const storedPrefs = secureLocalStorage.getItemObject<UserPreferences>('userPreferences');
  logger.info('Preferences retrieved', { storedPrefs });

  // Store in sessionStorage (encrypted)
  secureSessionStorage.setItem('sessionId', 'session-abc-123');
  secureSessionStorage.setItemObject('tempData', { key: 'value' });

  // Remove items
  secureLocalStorage.removeItem('userToken');

  // Clear all (use with caution!)
  // secureLocalStorage.clear();
}

// ============================================
// Redux Usage Examples (for use in React components)
// ============================================

export function useReduxExamples() {
  const dispatch = useAppDispatch();
  const count = useAppSelector((state) => state.sample.count);

  // Dispatch actions - state is automatically persisted and encrypted
  const increment = () => {
    dispatch({ type: 'increment' });
  };

  const decrement = () => {
    dispatch({ type: 'decrement' });
  };

  return { count, increment, decrement };
}

// ============================================
// Logger Examples
// ============================================

export function loggerExamples() {
  // PHI data will be automatically redacted based on environment
  const patientData = {
    name: 'John Doe',
    ssn: '123-45-6789',
    email: 'john@example.com',
    phone: '555-1234',
    dateOfBirth: '01/15/1990',
    medicalRecordNumber: 'MRN-12345',
  };

  // Debug log (only shown in non-production)
  logger.debug('Patient data retrieved', patientData);

  // Info log
  logger.info('User logged in', { userId: 'user-123' });

  // Warning log
  logger.warn('API rate limit approaching', { remaining: 10 });

  // Error log
  try {
    throw new Error('Something went wrong');
  } catch (error) {
    logger.error('Failed to process request', error, { requestId: 'req-123' });
  }
}

// ============================================
// Environment Configuration Examples
// ============================================

import { config } from '../config/environment';

export function environmentExamples() {
  // Check environment
  if (config.isDevelopment) {
    logger.debug('Running in development mode');
  }

  if (config.isProduction) {
    logger.info('Running in production mode');
    // PHI is always redacted in production
  }

  // Access configuration
  const apiUrl = config.apiUrl;
  const encryptionKeySet = !!config.encryptionKey;

  return { apiUrl, encryptionKeySet };
}
