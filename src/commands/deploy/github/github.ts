import { CliCommand, Option } from 'cilly'
import { say } from '../../../presentation'
import { DeployOptions } from '../deploy'

interface DeployGitHubOptions extends DeployOptions {
  version: string
  title: string
  description: string
  branch: string
  repo: string
  accessToken: string
}

const options: Option[] = [
  { name: ['-v', '--version'], description: 'The release version (e.g. v1.0.0) ', required: true, args: [{ name: 'version', required: true }] },
  { name: ['-t', '--title'], description: 'The release title (e.g. Release v1.0.0) ', required: true, args: [{ name: 'title', required: true }] },
  { name: ['-c', '--changelog'], description: 'Path to the changelog file', args: [{ name: 'path' }] },
  { name: ['-r', '--repo'], description: 'The repository name ', required: true, args: [{ name: 'repo', required: true }] },
  { name: ['-b', '--branch'], description: 'The branch name to create a release from', defaultValue: 'main', args: [{ name: 'branch' }] },
  { name: ['-a', '--access-token'], description: 'The GitHub access token ', required: true, args: [{ name: 'token', required: true }] }
]

export const github = new CliCommand('github', { inheritOpts: true })
  .withDescription('Create a GitHub release with your program as an asset')
  .withOptions(...options)
  .withHandler((args, opts: DeployGitHubOptions) => {
    say(`Creating Release-${opts.title}...`)
  })
