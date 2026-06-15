import { JsonLd } from "@/components/seo/JsonLd";
import {
  SITE_URL,
  SITE_NAME,
  WEBSITE_ID,
  buildMetadata,
  graph,
  breadcrumbSchema,
} from "@/lib/seo";
import AboutClient from "./AboutClient";

const PAGE_DESCRIPTION =
  "Why AI Tool Research exists: human curation over automated scraping. Meet the philosophy behind our hand-picked index of open-source AI tools.";

export const metadata = buildMetadata({
  title: "About",
  description: PAGE_DESCRIPTION,
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={graph(
          {
            "@type": "AboutPage",
            "@id": `${SITE_URL}/about#webpage`,
            url: `${SITE_URL}/about`,
            name: `About ${SITE_NAME}`,
            description: PAGE_DESCRIPTION,
            isPartOf: { "@id": WEBSITE_ID },
          },
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        )}
      />
      <AboutClient />
    </>
  );
}
