"use client";

import React from "react";
import { useParams } from "next/navigation";
import Settings from "@/features/dashboard/easypost/Settings";

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const workspaceId = params.id as string;

  return (
    <div className="p-4 md:p-8">
      <Settings workspaceId={workspaceId} />
    </div>
  );
}