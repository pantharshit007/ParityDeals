import Link from "next/link";
import React from "react";

function Navbar() {
  return (
    <header>
      <nav className="flex items-center gap-10 container font-semibold">
        <Link href="/"></Link>
      </nav>
    </header>
  );
}

export default Navbar;
