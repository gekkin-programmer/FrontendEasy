// src/app/dashboard/settings/integrations/callback/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FiLoader, FiCheckCircle, FiFacebook, FiInstagram } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <CallbackHandler />
    </Suspense>
  );
}

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  
  
  const resolveToken = useAction(api.meta.resolveTokenAndListPages);
  const saveAccount = useMutation(api.meta.saveMetaAccount);

  const [status, setStatus] = useState<"loading" | "selecting" | "saving">("loading");
  const [pages, setPages] = useState<any[]>([]);

  useEffect(() => {
    if (!code) {
      toast.error("No code found");
      router.push("/dashboard");
      return;
    }

    // Only run once
    if (status !== "loading") return;

    const exchange = async () => {
      try {
        const redirectUri = `${window.location.origin}/dashboard/settings/integrations/callback`;
        
        const data = await resolveToken({ code, redirectUri });
        setPages(data);
        setStatus("selecting");
      } catch (e: any) {
        toast.error("Failed to connect to Facebook: " + e.message);
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    };

    exchange();
  }, [code, resolveToken, router, status]);

    const handleSelect = async (page: any, type: "facebook" | "instagram") => {
    // 1. RETRIEVE THE ID
    const storedWorkspaceId = localStorage.getItem("connecting_workspace_id");
    
    if (!storedWorkspaceId) {
      toast.error("Lost workspace session. Please try again.");
      router.push("/dashboard");
      return;
    }

    // Cast string to ID type
    const workspaceId = storedWorkspaceId as Id<"workspaces">;

    setStatus("saving");
    try {
      if (type === "facebook") {
        await saveAccount({
          workspaceId, // <--- Using the correct ID now
          platform: "facebook",
          platformAccountId: page.id,
          name: page.name,
          accessToken: page.access_token,
          pictureUrl: page.picture?.data?.url,
        });
      } else {
        // ... instagram logic ...
         await saveAccount({
          workspaceId,
          platform: "instagram",
          platformAccountId: page.instagram_business_account.id,
          name: page.instagram_business_account.username,
          accessToken: page.access_token, 
          pictureUrl: page.instagram_business_account.profile_picture_url,
          metadata: { linkedPageId: page.id }
        });
      }

      toast.success("Connected successfully!");
      // Clean up
      localStorage.removeItem("connecting_workspace_id");
      // Redirect to the CORRECT workspace
      router.push(`/dashboard/${workspaceId}`); 
    } catch (e: any) {
      toast.error("Failed to save: " + e.message);
      setStatus("selecting");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border p-8">
        
        {status === "loading" && (
          <div className="text-center py-12">
            <FiLoader className="w-12 h-12 text-pink-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Talking to Meta...</h2>
            <p className="text-gray-500">Securing your tokens.</p>
          </div>
        )}

        {status === "saving" && (
          <div className="text-center py-12">
            <FiCheckCircle className="w-12 h-12 text-green-500 animate-bounce mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Saving Account...</h2>
          </div>
        )}

        {status === "selecting" && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Select Account</h2>
            <p className="text-gray-500 mb-6">Found {pages.length} Facebook Pages. Select which one to connect.</p>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {pages.map((page: any) => (
                <div key={page.id} className="border rounded-lg p-4 flex flex-col gap-4 hover:border-pink-300 transition-colors">
                  
                  <div className="flex items-center gap-3">
                    <img src={page.picture?.data?.url} alt="" className="w-10 h-10 rounded-full bg-gray-100" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{page.name}</h3>
                      <p className="text-xs text-gray-400">Page ID: {page.id}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleSelect(page, "facebook")}
                      variant="outline"
                      className="flex-1 gap-2 border-blue-200 hover:bg-blue-50 text-blue-700"
                    >
                      <FiFacebook /> Connect Page
                    </Button>

                    {page.instagram_business_account ? (
                      <Button 
                        onClick={() => handleSelect(page, "instagram")}
                        className="flex-1 gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0"
                      >
                         <FiInstagram /> Connect Instagram
                      </Button>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-xs text-gray-400 border border-dashed rounded bg-gray-50">
                        No Instagram Linked
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pages.length === 0 && (
                <div className="text-center py-8 bg-yellow-50 rounded border border-yellow-100 text-yellow-800">
                    No pages found. Make sure you granted permissions to the correct page on the previous screen.
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}