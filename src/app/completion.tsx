"use client";

import Header from "@/components/Header";
import ReverseLookupForm from "@/components/ReverseLookupForm";

export default function Completion() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-white to-cream w-full">
      <Header />
      <div className="w-full max-w-7xl px-2 md:px-8 flex justify-center mt-6">
        <ReverseLookupForm />
      </div>
    </div>
  );
}
