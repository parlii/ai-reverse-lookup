"use client";

import Header from "@/components/Header";
import ReverseLookupForm from "@/components/ReverseLookupForm";

export default function Completion() {
  return (
    <div className="flex flex-col items-center h-screen mt-4 mb-2 overflow-y-auto px-4 md:px-0">
      <Header />
      <ReverseLookupForm />
    </div>
  );
}
