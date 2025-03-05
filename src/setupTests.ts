// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Silence React act() warnings
// These warnings happen when state updates occur during tests
// This is expected behavior in many cases
const originalError = console.error;
console.error = (...args) => {
  if (/Warning: The current testing environment is not configured to support act/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
}; 