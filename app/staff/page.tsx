'use client';

import React from 'react';
import { StaffManagementV2 } from '../../components/staff/StaffManagementV2';

export default function StaffPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <StaffManagementV2 restaurantId={process.env.NEXT_PUBLIC_DEFAULT_RESTAURANT_ID || 'default_restaurant'} />
      </div>
    </main>
  );
}
