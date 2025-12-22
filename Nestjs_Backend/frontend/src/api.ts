// This file simulates API calls to a backend server.

/**
 * Simulates a login API call.
 * @param email The user's email.
 * @param password The user's password.
 * @returns A promise that resolves with user data on success or rejects with an error on failure.
 */
export const login = (email: string, password: string): Promise<{ token: string }> => {
  return new Promise((resolve, reject) => {
    // Simulate a network delay
    setTimeout(() => {
      // Check for specific credentials for demonstration purposes
      if (email === "test@example.com" && password === "password123") {
        console.log("Mock API: Login successful");
        resolve({ token: "fake-jwt-token" });
      } else {
        console.error("Mock API: Login failed - Invalid credentials");
        reject(new Error("Invalid email or password. Please try again."));
      }
    }, 1500); // 1.5 second delay
  });
};

/**
 * Simulates a signup API call.
 * @returns A promise that resolves on success or rejects if the email is already taken.
 */
export const signup = (fullName: string, email: string, password: string): Promise<{ success: boolean }> => {
  return new Promise((resolve, reject) => {
    // Simulate a network delay
    setTimeout(() => {
      // Check if the email is already "in use" for demonstration
      if (email.toLowerCase() === "taken@example.com") {
        console.error("Mock API: Signup failed - Email already in use");
        reject(new Error("This email address is already in use."));
      } else {
        console.log(`Mock API: Signup successful for ${fullName}`);
        resolve({ success: true });
      }
    }, 1500); // 1.5 second delay
  });
};

/**
 * Simulates a "forgot password" request.
 * In a real app, this would trigger a backend process to send an email.
 * This mock function will always resolve successfully for security reasons.
 */
export const requestPasswordReset = (email: string): Promise<{ success: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // We don't reject, even if the email doesn't exist.
      // This prevents users from discovering which emails are registered.
      console.log(`Mock API: Password reset requested for ${email}. In a real app, an email would be sent if the user exists.`);
      resolve({ success: true });
    }, 1500);
  });
};

/**
 * Simulates resetting a password with a token.
 */
export const resetPassword = (token: string, newPassword: string): Promise<{ success: boolean }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // For demonstration, we'll accept a specific mock token.
      if (token === "valid-mock-token") {
        console.log(`Mock API: Password has been successfully reset with token ${token}.`);
        resolve({ success: true });
      } else {
        console.error("Mock API: Password reset failed - Invalid or expired token.");
        reject(new Error("This password reset link is invalid or has expired."));
      }
    }, 1500);
  });
};