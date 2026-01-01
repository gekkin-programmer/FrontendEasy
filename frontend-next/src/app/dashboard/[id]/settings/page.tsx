"use client";

import { useParams } from "next/navigation";
import Settings from "@/src/components/easypost/Settings";
import { Id } from "@/convex/_generated/dataModel";

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const workspaceId = params.id as Id<"workspaces">;

  return (
    <div className="p-8">
      {/* Passing the ID from the URL directly into your Settings component */}
      <Settings workspaceId={workspaceId} />
    </div>
  );
}