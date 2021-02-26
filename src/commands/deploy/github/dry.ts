import { GitHubReleaseInfo } from './github'

export const dryRunReleaseInfo: GitHubReleaseInfo = {
  id: 1,
  url: '"https://api.github.com/repos/octocat/Hello-World/releases/assets/1"',
  html_url: 'https://github.com/octocat/Hello-World/releases/v1.0.0',
  assets_url: 'https://api.github.com/repos/octocat/Hello-World/releases/1/assets',
  upload_url: 'https://uploads.github.com/repos/octocat/Hello-World/releases/1/assets{?name,label}',
  author: {
    login: 'octocat'
  },
}