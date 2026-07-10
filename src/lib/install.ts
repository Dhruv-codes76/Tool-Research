/**
 * Shared install-command + download-asset metadata.
 *
 * Single source of truth imported by BOTH the admin editor (ToolForm) and the
 * public renderer (InstallSection / DownloadButton) so that what an editor types
 * is exactly what users see. No framework imports here — safe in client &
 * server components.
 */

// ---------------------------------------------------------------------------
// Install commands (terminal)
// ---------------------------------------------------------------------------

export interface InstallCommand {
  os: string;
  command: string;
}

/** OS options offered in the install-command editor. Android is intentionally
 *  excluded — Android (and GUI-only tools) have no terminal command and rely on
 *  the download assets instead. `icon` is a Material Symbols (outlined) name. */
export const OS_OPTIONS: { value: string; label: string; icon: string }[] = [
  { value: 'Universal', label: 'Universal', icon: 'public' },
  { value: 'macOS', label: 'macOS', icon: 'laptop_mac' },
  { value: 'Windows', label: 'Windows', icon: 'desktop_windows' },
  { value: 'Linux', label: 'Linux', icon: 'terminal' },
  { value: 'macOS & Linux', label: 'macOS & Linux', icon: 'terminal' },
  { value: 'Docker', label: 'Docker', icon: 'deployed_code' },
];

const OS_ICON_MAP: Record<string, string> = Object.fromEntries(
  OS_OPTIONS.map((o: any) => [o.value, o.icon]),
);

/** Material Symbols icon name for an OS label (falls back to a generic chip). */
export function osIcon(os: string): string {
  return OS_ICON_MAP[os] ?? 'terminal';
}

/** Parse the canonical install-command JSON shape into a typed array.
 *  Tolerant of legacy/plain-string values so old data still renders. */
export function parseInstallCommands(raw?: string | null): InstallCommand[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((c) => c && typeof c.command === 'string')
        .map((c: any) => ({ os: c.os || 'Universal', command: c.command }));
    }
  } catch {
    // legacy: a bare command string
  }
  return [{ os: 'Universal', command: String(raw) }];
}

// ---------------------------------------------------------------------------
// Download assets (multi-arch release files)
// ---------------------------------------------------------------------------

export interface DownloadAsset {
  label: string;
  url: string;
  os?: string;
  arch?: string;
}

export function parseDownloadAssets(raw?: string | null): DownloadAsset[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((a) => a && typeof a.url === 'string' && a.url.trim() !== '')
        .map((a: any) => ({
          label: a.label || a.url,
          url: a.url,
          os: a.os || undefined,
          arch: a.arch || undefined,
        }));
    }
  } catch {
    // ignore
  }
  return [];
}

/** Release files that should never be offered as a download (checksums,
 *  signatures, SBOMs, source tarballs, update manifests, etc.). */
export function isLikelyJunkAsset(name: string): boolean {
  const n = name.toLowerCase();
  return (
    /(^|[._-])(checksums?|sha256|sha512|md5|sums)([._-]|\.txt|$)/.test(n) ||
    /\.(sig|asc|pem|sbom|spdx|cert|crt|blockmap)$/.test(n) ||
    /sbom/.test(n) ||
    /(^|[._-])latest(-mac|-linux)?\.(yml|yaml|json)$/.test(n) ||
    /^source code/.test(n)
  );
}

/** Best-effort OS + architecture guess from an asset filename. */
export function guessAssetOsArch(name: string): { os?: string; arch?: string } {
  const n = name.toLowerCase();

  let os: string | undefined;
  if (/(\.dmg|\.pkg|darwin|macos|osx|apple)/.test(n)) os = 'macOS';
  else if (/(\.exe|\.msi|windows|win32|win64|-win[._-]|\bwin\b)/.test(n)) os = 'Windows';
  else if (/(\.appimage|\.deb|\.rpm|\.snap|\.flatpak|linux)/.test(n)) os = 'Linux';
  else if (/(\.apk|android)/.test(n)) os = 'Android';

  let arch: string | undefined;
  if (/(arm64|aarch64|apple[._-]?silicon)/.test(n)) arch = 'arm64';
  else if (/(x86[._-]?64|x64|amd64)/.test(n)) arch = 'x64';
  else if (/(armv7|armhf|\barm\b)/.test(n)) arch = 'arm';
  else if (/(i386|i686|x86|win32)/.test(n)) arch = 'x86';
  else if (/universal/.test(n)) arch = 'universal';

  return { os, arch };
}

const ARCH_FRIENDLY: Record<string, string> = {
  arm64: 'Apple Silicon / ARM64',
  x64: '64-bit',
  arm: 'ARM',
  x86: '32-bit',
  universal: 'Universal',
};

/** Friendly default label for a release asset, e.g. "macOS · Apple Silicon / ARM64".
 *  Falls back to the raw filename when nothing can be inferred. */
export function guessAssetLabel(name: string): string {
  const { os, arch } = guessAssetOsArch(name);
  const archLabel = arch ? ARCH_FRIENDLY[arch] ?? arch : undefined;
  if (os && archLabel) return `${os} · ${archLabel}`;
  if (os) return os;
  if (archLabel) return archLabel;
  return name;
}
