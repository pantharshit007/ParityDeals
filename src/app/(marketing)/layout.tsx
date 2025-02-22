import React from "react";

function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="selection:bg-[hsl(320,65%,52%,20%)]">
      <h1>Marketing Page</h1>
      {children}
    </div>
  );
}

export default MarketingLayout;
