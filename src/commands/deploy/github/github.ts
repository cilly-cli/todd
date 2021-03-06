import { CliCommand, Option } from 'cilly'
import { DeployOptions } from '../deploy'
import { say, verbose, yellow } from '../../../presentation'
import { readFileSync, writeFileSync } from 'fs'
import { Global } from '../../../global'
import { sep } from 'path'
import { http } from '../../../http'
import { dryRunReleaseInfo } from './dry'
import { AxiosRequestConfig } from 'axios'
import { promptIfUndefinedOr } from '../../../utils'
import { promptAccessToken, promptAssets, promptBranch, promptChangelogPath, promptDraft, promptPrerelease, promptRepository, promptTitle, promptVersion } from './prompts'

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
  out: string
}

export interface GitHubReleaseInfo {
  id: number
  url: string
  assets_url: string
  upload_url: string
  html_url: string
  author: {
    login: string
  }
}

const options: Option[] = [
  { name: ['-v', '--version'], description: 'The release version (e.g. v1.0.0)', args: [{ name: 'version', required: true }], onProcess: promptIfUndefinedOr(promptVersion) },
  { name: ['-t', '--title'], description: 'The release title (e.g. Release v1.0.0)', args: [{ name: 'title', required: true }], onProcess: promptIfUndefinedOr(promptTitle) },
  { name: ['-c', '--changelog'], description: 'Path to the changelog file', args: [{ name: 'path', required: true }], onProcess: promptIfUndefinedOr(promptChangelogPath) },
  { name: ['-r', '--repo'], description: 'The repository owner/name', args: [{ name: 'repo', required: true }], onProcess: promptIfUndefinedOr(promptRepository) },
  { name: ['-b', '--branch'], description: 'The branch name to create a release from', defaultValue: 'main', args: [{ name: 'branch', required: true }], onProcess: promptIfUndefinedOr(promptBranch) },
  { name: ['-oa', '--access-token'], description: `The GitHub access token ${yellow('(see https://tinyurl.com/bdvkvu29)')}`, args: [{ name: 'token', required: true }], onProcess: promptIfUndefinedOr(promptAccessToken) },
  { name: ['-d', '--draft'], description: 'Create a draft release', onProcess: promptIfUndefinedOr(promptDraft) },
  { name: ['-p', '--pre-release'], description: 'Create a pre-release', onProcess: promptIfUndefinedOr(promptPrerelease) },
  { name: ['-a', '--assets'], description: 'List of paths to asset files', args: [{ name: 'paths', variadic: true }], onProcess: promptIfUndefinedOr(promptAssets) },
  { name: ['-o', '--out'], description: 'Name of file to dump release info to', defaultValue: 'release.json', negatable: true, args: [{ name: 'file', required: true }] }
]

const buildReleaseRequestData = (opts: DeployGitHubOptions): any => ({
  tag_name: opts.version,
  target_commitish: opts.branch,
  name: opts.title,
  body: opts.changelog || '',
  draft: opts.draft,
  prerelease: opts.preRelease
})

const makeRelease = async (opts: DeployGitHubOptions): Promise<GitHubReleaseInfo> => {
  say(`Creating release "${opts.title}" with tag ${opts.version}`)

  const payload = buildReleaseRequestData(opts)
  const config: AxiosRequestConfig = {
    headers: {
      'Authorization': `token ${opts.accessToken}`
    }
  }
  const release = await http.post<GitHubReleaseInfo>(`https://api.github.com/repos/${opts.repo}/releases`, payload, config)

  if (Global.dryRun) {
    return dryRunReleaseInfo
  }

  release.upload_url = release.upload_url.replace('{?name,label}', '')
  return release
}

const uploadAsset = async (path: string, releaseInfo: GitHubReleaseInfo, accessToken: string): Promise<void> => {
  say(`Uploading asset "${path}"...`)
  const file = path.split(sep).pop()
  const url = `${releaseInfo.upload_url}?name=${file}`
  const config: AxiosRequestConfig = {
    maxBodyLength: Infinity,
    headers: {
      'Authorization': `token ${accessToken}`,
      'Content-Type': 'application/gzip'
    }
  }

  const assetBuffer = readFileSync(path)
  await http.post(url, assetBuffer, config)
}

export const github = new CliCommand('github', { inheritOpts: true })
  .withDescription('Create a GitHub release with your program as an asset')
  .withOptions(...options)
  .withHandler(async (args, opts: DeployGitHubOptions) => {
    if (opts.changelog) {
      opts.changelog = readFileSync(opts.changelog).toString()
    }

    const releaseInfo = await makeRelease(opts)

    say(`Successfully created release ${opts.title}!`, 'success')

    verbose(releaseInfo)

    for (const asset of opts.assets) {
      await uploadAsset(asset, releaseInfo, opts.accessToken)
    }

    if (opts.out) {
      writeFileSync(opts.out, JSON.stringify(releaseInfo, null, 2))
    }
  })
