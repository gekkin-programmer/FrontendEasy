// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export const auth = betterAuth({
//   adapter: prismaAdapter(prisma, {
//     provider: "postgresql",
//   }),

//   emailAndPassword: {
//     enabled: true,
//     requireEmailVerification: true,
//   },

//   socialProviders: {
//     google: {
//       clientId: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//       // Optional: customize redirect URI
//       // redirectURI: `${process.env.APP_URL}/api/auth/callback/google`
//     },
//   },

//   session: {
//     expiresIn: 60 * 60 * 24 * 7, // 7 days
//     updateAge: 60 * 60 * 24, // 1 day
//     cookieCache: {
//       enabled: true,
//       maxAge: 5 * 60, // 5 minutes
//     },
//   },

//   //Advanced Session Configuration
//   advanced: {
//     cookiePrefix: "better_auth",
//     crossSubDomainCookies: {
//       enabled: false,
//     },
//   },

//   baseURL: process.env.APP_URL || "http://localhost:3001",

//   trustedOrigins: [
//     process.env.FRONTEND_URL || "http://localhost:3000",
//   ],
// });

// export type Session = typeof auth.$Infer.Session.session;
// export type User =  typeof auth.$Infer.Session.user
