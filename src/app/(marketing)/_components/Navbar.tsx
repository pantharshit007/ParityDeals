import React from "react";
import Link from "next/link";

import BrandLogo from "@/components/BrandLogo";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

function Navbar() {
  return (
    <header className="flex py-3 shadow-xl rounded-b-3xl fixed top-0 w-full z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <nav className="flex items-center gap-10 container font-semibold">
        <Link href="/" className="mr-auto">
          <BrandLogo />
        </Link>
        <Link className="text-lg" href="#">
          Features
        </Link>
        <Link className="text-lg" href="/#pricing">
          Pricing
        </Link>
        <Link className="text-lg" href="#">
          About
        </Link>
        <span className="text-lg">
          <SignedIn>
            <Link href="/dashboard">Dashboard</Link>
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <span className="text-pink-400">Login</span>
            </SignInButton>
          </SignedOut>
        </span>
      </nav>
    </header>
  );
}

export default Navbar;
