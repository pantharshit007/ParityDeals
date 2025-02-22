import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";
import { ArrowRightIcon } from "lucide-react";
import React from "react";

function Hero() {
  return (
    <section className="min-h-screen bg-[radial-gradient(hsl(0,72%,65%,40%),hsl(24,62%,73%,40%),hsl(var(--background))_60%)] flex items-center justify-center text-center text-balance flex-col gap-8 px-4">
      <h1 className="text-5xl lg:text-6xl xl:text-7xl  font-bold tracking-tight m-4">
        Price Smarter, Sell{" "}
        <span className="text-pink-500 font-heading font-bold uppercase">bigger!</span>
      </h1>
      <p className="text-lg lg:text-2xl max-w-screen-xl">
        Optimize your product pricing across countries to maximize sales. Capture 85% of the
        untapped market with location-based dynamic pricing
      </p>
      <SignUpButton>
        <Button className="text-lg p-6 rounded-xl flex gap-2">
          Get started for free <ArrowRightIcon className="size-5" />
        </Button>
      </SignUpButton>
    </section>
  );
}

export default Hero;
