'use client';

/**
 * Compatibility re-export — auth state lives in GithubAuthProvider (one listener app-wide).
 */
export { GithubAuthProvider, useGithubAuth } from './github-auth-context';
