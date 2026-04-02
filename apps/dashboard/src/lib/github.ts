import { Octokit } from 'octokit';

export function createOctokitClient(accessToken: string) {
  return new Octokit({ auth: accessToken });
}
