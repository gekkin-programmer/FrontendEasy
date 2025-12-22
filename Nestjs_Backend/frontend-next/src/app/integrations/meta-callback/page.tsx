'use client';

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Actions
  const exchangeFacebook = useAction(api.auth.exchangeFacebookCode);
  const exchangeLinkedin = useAction(api.auth.exchangeLinkedinCode);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Finalizing connection...");

  useEffect(() => {
    // 1. Get Params
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // This is the workspaceId we passed earlier
    const error = searchParams.get("error"); // Facebook sends this if user clicks Cancel

    const handleCallback = async () => {
      // Handle User Cancel
      if (error) {
        setStatus("error");
        setMessage("Connection cancelled by user.");
        setTimeout(() => router.push(`/dashboard/${state}/settings`), 2000);
        return;
      }

      if (!code || !state) {
        setStatus("error");
        setMessage("Invalid callback parameters.");
        return;
      }

      try {
        // 2. Identify Platform & Exchange
        // Since the URL doesn't explicitly say "facebook", we try one, then the other.
        // In a perfect world, we'd add ?platform=facebook to the redirect URI, 
        // but Facebook is strict about matching URIs exactly.
        
        // HEURISTIC: Try Facebook first.
        try {
            await exchangeFacebook({ code, workspaceId: state as Id<"workspaces"> });
            setStatus("success");
            setMessage("Successfully connected Facebook Page!");
            setTimeout(() => router.push(`/dashboard/${state}/settings`), 1500);
            return;
        } catch (fbError: any) {
            // If the error isn't about the code being invalid for FB, throw it.
            // But usually, an invalid code means it might be LinkedIn.
            console.log("Not Facebook, trying LinkedIn...", fbError);
        }

        // Try LinkedIn
        try {
            await exchangeLinkedin({ code, workspaceId: state as Id<"workspaces"> });
            setStatus("success");
            setMessage("Successfully connected LinkedIn Profile!");
            setTimeout(() => router.push(`/dashboard/${state}/settings`), 1500);
        } catch (liError: any) {
             throw new Error("Could not validate token with any provider.");
        }

      } catch (error: any) {
        console.error(error);
        setStatus("error");
        setMessage(`Connection Failed: ${error.message || "Unknown error"}`);
      }
    };

    // Run once
    handleCallback();
  }, [searchParams, exchangeFacebook, exchangeLinkedin, router]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
        
        {status === "loading" && (
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 text-[#3C48F6] animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Connecting...</h2>
                <p className="text-gray-500">{message}</p>
            </div>
        )}

        {status === "success" && (
            <div className="flex flex-col items-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Success!</h2>
                <p className="text-green-600">{message}</p>
                <p className="text-xs text-gray-400 mt-4">Redirecting you back...</p>
            </div>
        )}

        {status === "error" && (
            <div className="flex flex-col items-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Failed</h2>
                <p className="text-red-600 mb-6">{message}</p>
                <button 
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
                >
                    Return to Dashboard
                </button>
            </div>
        )}
      </div>
    </div>
  );
}

// Wrap in Suspense because useSearchParams causes client-side rendering requirements
export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}