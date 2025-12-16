import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      {/* This component handles the token exchange automatically */}
      <AuthenticateWithRedirectCallback 
        signInForceRedirectUrl="/onboarding"
        signUpForceRedirectUrl="/onboarding"
      />
    </div>
  );
}