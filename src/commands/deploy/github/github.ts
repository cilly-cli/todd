import { CliCommand, Option } from 'cilly'
import { DeployOptions } from '../deploy'
import { say } from '../../../presentation'
import { readFileSync } from 'fs'
import { Shell } from '../../../shell'

interface DeployGitHubOptions extends DeployOptions {
  version: string
  title: string
  changelog: string
  branch: string
  repo: string
  accessToken: string
  draft: boolean
}

const options: Option[] = [
  { name: ['-v', '--version'], description: 'The release version (e.g. v1.0.0) ', required: true, args: [{ name: 'version', required: true }] },
  { name: ['-t', '--title'], description: 'The release title (e.g. Release v1.0.0) ', required: true, args: [{ name: 'title', required: true }] },
  { name: ['-c', '--changelog'], description: 'Path to the changelog file', args: [{ name: 'path' }] },
  { name: ['-r', '--repo'], description: 'The repository name ', required: true, args: [{ name: 'repo', required: true }] },
  { name: ['-b', '--branch'], description: 'The branch name to create a release from', defaultValue: 'main', args: [{ name: 'branch' }] },
  { name: ['-a', '--access-token'], description: 'The GitHub access token ', required: true, args: [{ name: 'token', required: true }] },
  { name: ['-d', '--draft'], description: 'Create a draft release', defaultValue: true, negatable: true }
]

const buildReleaseApiUrl = (opts: DeployGitHubOptions): string => `https://api.github.com/repos/${opts.repo}/releases?access_token=${opts.accessToken}`
const buildReleaseRequestData = (opts: DeployGitHubOptions): string => JSON.stringify({
  tag_name: opts.version,
  target_commitish: opts.branch,
  name: opts.title,
  body: opts.changelog || '',
  draft: opts.draft
})

export const github = new CliCommand('github', { inheritOpts: true })
  .withDescription('Create a GitHub release with your program as an asset')
  .withOptions(...options)
  .withHandler((args, opts: DeployGitHubOptions) => {
    if (opts.changelog) {
      opts.changelog = readFileSync(opts.changelog).toString()
    }

    say(`Creating release "${opts.title}" with tag ${opts.version}`)
    Shell.run(`curl --data "${buildReleaseRequestData(opts)}" "${buildReleaseApiUrl(opts)}"`)
  })
