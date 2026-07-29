'use client';

import React from 'react';
import Engagement from "./Engagement";

export const EngagementWithTabs = () => {
  return (
    <div className="flex flex-col h-full w-full max-w-full mx-auto">
      <div className="flex-1 min-h-0 overflow-hidden w-full">
        <Engagement />
      </div>
    </div>
  );
};
