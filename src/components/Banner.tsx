import { env_client } from "@/data/env/env-client";

export function Banner({
  message,
  mappings,
  customization,
  canRemoveBranding,
}: {
  canRemoveBranding: boolean;
  message: string;
  mappings: {
    coupon: string;
    discount: string;
    country: string;
  };
  customization: {
    backgroundColor: string;
    textColor: string;
    fontSize: string;
    isSticky: boolean;
    classPrefix?: string | null;
  };
}) {
  const prefix = customization.classPrefix ?? "";
  const mappedMessage = Object.entries(mappings).reduce((mappedMessage, [key, value]) => {
    return mappedMessage.replace(new RegExp(`{${key}}`, "g"), value);
  }, message.replace(/'/g, "&#39;")); // replace single quotes with html entities

  return (
    <>
      <style type="text/css">
        {`
          .${prefix}parity-deals-container {
            all: revert;
            display: flex;
            flex-direction: column;
            gap: .5em;
            background-color: ${customization.backgroundColor};
            color: ${customization.textColor};
            font-size: ${customization.fontSize};
            font-family: inherit;
            padding: 1rem;
            ${customization.isSticky ? "position: sticky;" : ""}
            left: 0;
            right: 0;
            top: 0;
            text-wrap: balance;
            text-align: center;
          }

          .${prefix}parity-deals-branding {
            color: inherit;
            font-size: inherit;
            display: inline-block;
            text-decoration: underline;
          }
        `}
      </style>

      <div className={`${prefix}parity-deals-container ${prefix}easy-ppp-override`}>
        <span
          className={`${prefix}parity-deals-message ${prefix}easy-ppp-override`}
          dangerouslySetInnerHTML={{
            __html: mappedMessage,
          }}
        />
        {!canRemoveBranding && (
          <a
            className={`${prefix}parity-deals-branding`}
            href={`${env_client.NEXT_PUBLIC_SERVER_URL}`}
          >
            Powered by Parity Deals 🛒
          </a>
        )}
      </div>
    </>
  );
}
