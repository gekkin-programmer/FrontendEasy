export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN, // <--- THIS is the name you need
      applicationID: "convex",
    },
  ],
};