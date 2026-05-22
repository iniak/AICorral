export interface CatalogSource {
  manager: 'npm' | 'pip' | 'brew';
  package: string;
  os: string[];
}

export interface CatalogEntry {
  id: string;
  name: string;
  vendor: string;
  mono: string;
  hue: number;
  description: string;
  tags: string[];
  launchCmd: string;
  runtime: string;
  sources: CatalogSource[];
}

export interface InstalledState {
  id: string;
  installed: boolean;
  currentVersion: string | null;
  binaryPath: string | null;
  installedAt: string | null;
}

export interface LatestVersions {
  [id: string]: string;
}

export interface CliView extends CatalogEntry {
  installed: boolean;
  currentVersion: string | null;
  latestVersion: string | null;
  binaryPath: string | null;
  installedAt: string | null;
  availableOnOs: boolean;
}

export interface DoctorCheck {
  name: string;
  status: 'ok' | 'warn' | 'fail' | 'muted';
  detail: string;
}

export interface Settings {
  npmRegistry: string;
  pipIndexUrl: string;
  httpProxy: string;
}

export interface ProgressEvent {
  id: string;
  line: string;
  phase: 'running' | 'done' | 'error';
}
