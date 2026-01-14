/**
 * Application configuration
 * Jira integration utilities
 */

// Jira key validation regex - Standard Jira format: PROJ-123
export const JIRA_KEY_PATTERN = /^[A-Z][A-Z0-9]+-[0-9]+$/;
export const JIRA_KEY_PATTERN_STRING = "[A-Z][A-Z0-9]+-[0-9]+";

/**
 * Get Jira base URL from environment variable
 */
export function getJiraBaseUrl(): string | null {
  return process.env.NEXT_PUBLIC_JIRA_BASE_URL || null;
}

/**
 * Check if Jira integration is configured
 */
export function isJiraConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_JIRA_BASE_URL;
}

/**
 * Build Jira URL for a key (project or task)
 * Returns null if Jira is not configured
 */
export function getJiraUrl(jiraKey: string): string | null {
  const baseUrl = getJiraBaseUrl();
  if (!baseUrl || !jiraKey) {
    return null;
  }
  return `${baseUrl}/browse/${jiraKey}`;
}

/**
 * Validate Jira key format
 * Returns true if valid or if key is null/empty (optional field)
 */
export function validateJiraKey(key: string | null | undefined): boolean {
  if (!key || key.trim() === "") {
    return true; // Optional field
  }
  return JIRA_KEY_PATTERN.test(key);
}

/**
 * Get validation error message for a Jira key
 * Returns null if valid
 */
export function getJiraKeyErrorMessage(key: string): string | null {
  if (!key || key.trim() === "") {
    return null; // Optional field
  }
  if (!validateJiraKey(key)) {
    return "Invalid Jira key format. Expected format: PROJ-123";
  }
  return null;
}
