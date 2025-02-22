import React from "react";
import { ShoppingCart } from "lucide-react";

function BrandLogo() {
  return (
    <span className="flex items-center gap-2 font-semibold flex-shrink-0 text-lg">
      <ShoppingCart className="size-8 text-pink-600" />
      <span>
        Parity <span className="text-pink-400">Deals</span>
      </span>
    </span>
  );
}

export default BrandLogo;
