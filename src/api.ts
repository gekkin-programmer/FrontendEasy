// src/api.ts

export const login = async (email: string, password: string) => {
  console.log("Attempting login with:", email);
  
  // Simulate a network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock success (You can change this logic later)
  if (email && password) {
    return {
      success: true,
      token: "fake-jwt-token-123",
      user: { name: "Dr Ahmed", email: email }
    };
  }

  throw new Error("Invalid credentials");
};