import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";
import React from "react";

function Footer() {
  return (
    <footer className="container pt-16 pb-8 flex flex-col sm:flex-row gap-8 sm:gap-4  justify-between items-start">
      <Link href="/">
        <BrandLogo />
      </Link>
      <div className="flex w-[60%] flex-col sm:flex-row gap-8">
        <div className="flex w-full flex-col gap-8">
          <FooterLinkGroup
            title="Help"
            links={[
              { label: "PPP Discounts", href: "#/ppp-discounts" },
              { label: "Discount API", href: "#/discount-api" },
            ]}
          />
          <FooterLinkGroup
            title="Solutions"
            links={[
              { label: "Newsletter", href: "#/newsletter" },
              { label: "SaaS Business", href: "#/saas-business" },
              { label: "Online Courses", href: "#/online-courses" },
            ]}
          />
        </div>

        <div className="flex w-full flex-col gap-8">
          <FooterLinkGroup
            title="Features"
            links={[{ label: "PPP Discounts", href: "#/ppp-discounts" }]}
          />
          <FooterLinkGroup
            title="Tools"
            links={[
              { label: "Salary Converter", href: "#/salary-converter" },
              { label: "Coupon Generator", href: "#/coupon-generator" },
              { label: "Stripe App", href: "#/stripe-app" },
            ]}
          />
          <FooterLinkGroup
            title="Company"
            links={[
              { label: "Affiliate", href: "#/affiliate" },
              { label: "Twitter", href: "#/twitter" },
              { label: "Terms of Service", href: "#/terms-of-service" },
            ]}
          />
        </div>

        <div className="flex w-full flex-col gap-8">
          <FooterLinkGroup
            title="Integrations"
            links={[
              { label: "Lemon Squeezy", href: "#/lemon-squeezy" },
              { label: "Gumroad", href: "#/gumroad" },
              { label: "Stripe", href: "#/stripe" },
              { label: "Chargebee", href: "#/chargebee" },
              { label: "Paddle", href: "#/paddle" },
            ]}
          />
          <FooterLinkGroup
            title="Tutorials"
            links={[
              { label: "Any Website", href: "#/any-website" },
              { label: "Lemon Squeezy", href: "#/lemon-squeezy" },
              { label: "Gumroad", href: "#/gumroad" },
              { label: "Stripe", href: "#/stripe" },
              { label: "Chargebee", href: "#/chargebee" },
              { label: "Paddle", href: "#/paddle" },
            ]}
          />
        </div>
      </div>
    </footer>
  );
}

export default Footer;

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold font-serif">{title}</h3>
      <ul className="flex flex-col gap-2 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
