import { CliCommand, Option } from 'cilly'
import { DeployOptions } from '../deploy'
import { say } from '../../../presentation'
import { readFileSync } from 'fs'
import { Shell } from '../../../shell'
import { Global } from '../../../global'
import { sep } from 'path'

interface DeployGitHubOptions extends DeployOptions {
  version: string
  title: string
  changelog: string
  branch: string
  repo: string
  accessToken: string
  draft: boolean
  preRelease: boolean
  assets: string[]
}

interface GitHubReleaseInfo {
  id: string
  url: string
  assets_url: string
  upload_url: string
  html_url: string
  author: {
    login: string
  }
}

const options: Option[] = [
  { name: ['-v', '--version'], description: 'The release version (e.g. v1.0.0) ', required: true, args: [{ name: 'version', required: true }] },
  { name: ['-t', '--title'], description: 'The release title (e.g. Release v1.0.0) ', required: true, args: [{ name: 'title', required: true }] },
  { name: ['-c', '--changelog'], description: 'Path to the changelog file', args: [{ name: 'path' }] },
  { name: ['-r', '--repo'], description: 'The repository name ', required: true, args: [{ name: 'repo', required: true }] },
  { name: ['-b', '--branch'], description: 'The branch name to create a release from', defaultValue: 'main', args: [{ name: 'branch' }] },
  { name: ['-oa', '--access-token'], description: 'The GitHub access token ', required: true, args: [{ name: 'token', required: true }] },
  { name: ['-d', '--draft'], description: 'Create a draft release', defaultValue: true, negatable: true },
  { name: ['-p', '--pre-release'], description: 'Create a pre-release', defaultValue: false },
  { name: ['-a', '--assets'], description: 'List of paths to asset files', defaultValue: [], args: [{ name: 'paths', variadic: true }] }
]

const buildReleaseApiUrl = (opts: DeployGitHubOptions): string => `https://api.github.com/repos/${opts.repo}/releases?access_token=${opts.accessToken}`
const buildReleaseRequestData = (opts: DeployGitHubOptions): string => JSON.stringify({
  tag_name: opts.version,
  target_commitish: opts.branch,
  name: opts.title,
  body: opts.changelog || '',
  draft: opts.draft,
  prerelease: opts.preRelease
})

const makeRelease = (opts: DeployGitHubOptions): GitHubReleaseInfo => {
  say(`Creating release "${opts.title}" with tag ${opts.version}`)
  const curl = Shell.run(`curl ${buildReleaseApiUrl(opts)} -d '${buildReleaseRequestData(opts)}'`)
  const response = curl?.stdout

  if (!response) {
    if (Global.dryRun) {
      return {
        id: 'id',
        url: 'url',
        assets_url: 'assets_url',
        upload_url: 'upload_url',
        html_url: 'html_url',
        author: {
          login: 'login'
        },
      }
    } else {
      throw new Error(`Something went wrong while creating the release: ${curl?.stderr}`)
    }
  }

  const releaseInfo = JSON.parse(response) as GitHubReleaseInfo
  releaseInfo.upload_url = releaseInfo.upload_url.replace('{?name,label}', '')
  return releaseInfo
}

const uploadAsset = (path: string, releaseInfo: GitHubReleaseInfo, accessToken: string): void => {
  say(`Uploading asset "${path}"...`)
  const fileName = path.split(sep).pop()
  const args = ['-sL',
    `-H "Authorization: token ${accessToken}"`,
    `--data-binary @"${path}"`,
    `"${releaseInfo.upload_url}&name=${fileName}"`,
  ]
  Shell.run(`curl ${args.join(' ')}`)
  return
}

export const github = new CliCommand('github', { inheritOpts: true })
  .withDescription('Create a GitHub release with your program as an asset')
  .withOptions(...options)
  .withHandler((args, opts: DeployGitHubOptions) => {
    if (opts.changelog) {
      opts.changelog = readFileSync(opts.changelog).toString()
    }

    const releaseInfo = makeRelease(opts)
    for (const asset of opts.assets) {
      uploadAsset(asset, releaseInfo, opts.accessToken)
    }
  })
