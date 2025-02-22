import Link from "next/link";
import React from "react";
import AmieIcon from "../_icons/AmieIcon";
import DrafbitIcon from "../_icons/DrafbitIcon";

function TrustedBy() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container py-16 flex flex-col gap-16 px-8 md:px-16">
        <h2 className="text-3xl text-center text-balance font-serif">
          Trusted by the top modern companies
        </h2>
        <div className=" grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-16">
          <Link href="https://youtu.be/xvFZjo5PgG0">
            <DrafbitIcon />
          </Link>
          <Link href="https://youtu.be/xvFZjo5PgG0">
            <AmieIcon />
          </Link>
          <Link href="https://youtu.be/xvFZjo5PgG0">
            <DrafbitIcon />
          </Link>
          <Link href="https://youtu.be/xvFZjo5PgG0">
            <AmieIcon />
          </Link>
          <Link href="https://youtu.be/xvFZjo5PgG0">
            <DrafbitIcon />
          </Link>
          <Link href="https://youtu.be/xvFZjo5PgG0">
            <AmieIcon />
          </Link>
          <Link href="https://youtu.be/xvFZjo5PgG0">
            <DrafbitIcon />
          </Link>
          <Link href="https://youtu.be/xvFZjo5PgG0">
            <AmieIcon />
          </Link>
          <Link href="https://youtu.be/xvFZjo5PgG0">
            <DrafbitIcon />
          </Link>
          <Link className="md:max-xl:hidden" href="https://youtu.be/xvFZjo5PgG0">
            <AmieIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default TrustedBy;
