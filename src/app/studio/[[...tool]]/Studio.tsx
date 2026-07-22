"use client";

// Client boundary for the embedded Studio. The `sanity` package (pulled in via
// sanity.config) calls React.createContext at module load, which throws if
// evaluated in a Server Component — so the config import and <NextStudio> live
// here, behind "use client". The route's page.tsx stays a Server Component so
// it can still export metadata/viewport/dynamic.
import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export default function Studio() {
  return <NextStudio config={config} />;
}
