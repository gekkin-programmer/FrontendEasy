import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  // We explicitly tell it: "Once you are done processing, GO HERE"
  return (
    <AuthenticateWithRedirectCallback 
      signInForceRedirectUrl="/dashboard" 
      signUpForceRedirectUrl="/onboarding"
    />
  );
}