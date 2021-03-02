import { CliCommand } from 'cilly'
import { green, muted, say, verbose, yellow } from '../../../presentation'
import { DeployOptions } from '../deploy'
import { brewHooks, GITHUB_REPO_URL_REGEX } from './hooks'
import crypto from 'crypto'
import { shell } from '../../../shell'
import { readFileSync } from 'fs'
import { formulaTemplate } from './formula.template'
import { http, HttpException } from '../../../http'
import { AxiosRequestConfig } from 'axios'

export interface DeployBrewOptions extends DeployOptions {
  tarballUrl: string
  homebrewRepoUrl: string,
  accessToken: string
  version: string
  description: string
  homepage: string
  name: string
}

/** Specification
 * Get the executable
 *   - A path to the executable
 *   - If it's not .tar.gz, tarball it
 *   - ... or a URL to the executable
 *   - must be tar.gz
 *
 */
export const brew = new CliCommand('brew', { inheritOpts: true })
  .withDescription(`
  Deploy your program to Homebrew. 
  
  Example usage:

      ${muted('todd deploy brew \\')}
        ${muted('--tarball-url https://')}${yellow('github.com')}${muted('/cilly-cli/todd/releases/latest/download/todd.tar.gz \\')}
        ${muted('--homebrew-repo-url https://github.com/cilly-cli/')}${yellow('homebrew-todd')}${muted(' \\')}
        ${muted('--access-token ${GITHUB_ACCESS_TOKEN}')}

  The ${yellow('--tarball-url')} option must be a .tar.gz tarball of your program.

  The ${yellow('--homebrew-repo-url')} option must start with ${yellow('homebrew-<project_name>')}. This
  allows users to install your package with just ${yellow('brew install <project_name>')} after tapping your repository.
  To use a repository not starting with homebrew-*, pass --force to the command.

  See ${yellow('https://tinyurl.com/bdvkvu29')} on how to create access tokens.
  The token must repo:all privileges.
  `)
  .withOptions(
    { name: ['-tu', '--tarball-url'], description: 'URL to the tarball (.tar.gz) of your program', args: [{ name: 'url', required: true }], onProcess: brewHooks.tarballUrlHook },
    { name: ['-n', '--name'], description: 'The binary file name', args: [{ name: 'name', required: true }], onProcess: brewHooks.nameHook },
    { name: ['-hu', '--homebrew-repo-url'], description: 'URL to a GitHub repo named "homebrew-<project_name>" to upload the Formula to', args: [{ name: 'url', required: true }], onProcess: brewHooks.homebrewUrlHook },
    { name: ['-oa', '--access-token'], description: `The GitHub access token to the Homebrew repo ${yellow('(see https://tinyurl.com/bdvkvu29)')}`, args: [{ name: 'token', required: true }], onProcess: brewHooks.accessTokenHook },
    { name: ['-v', '--version'], description: 'Package version', args: [{ name: 'version', required: true }], onProcess: brewHooks.versionHook },
    { name: ['-d', '--description'], description: 'Package description', args: [{ name: 'desc', required: true }], onProcess: brewHooks.descriptionHook },
    { name: ['-h', '--homepage'], description: 'Package homepage URL', args: [{ name: 'url', required: true }], onProcess: brewHooks.homepageHook }
  )
  .withHandler(async (args, opts: DeployBrewOptions) => {
    const tempTarballFile = `__todd_tmp__${crypto.randomInt(1000000)}.tar.gz`
    shell.run(`curl -L -o ${tempTarballFile} ${opts.tarballUrl}`)

    const tarball = readFileSync(tempTarballFile)
    const checksum = crypto.createHash('sha256').update(tarball).digest('hex')

    verbose(`Checksum for package is ${checksum}`)
    shell.run(`rm ${tempTarballFile}`)

    const formula = formulaTemplate({
      binary: opts.name,
      checksum: checksum,
      description: opts.description,
      download: opts.tarballUrl,
      homepage: opts.homepage,
      version: opts.version
    })

    verbose('Generated Brew Formula:')
    verbose(formula)

    if (GITHUB_REPO_URL_REGEX.test(opts.homebrewRepoUrl)) {
      const [owner, repo] = (opts.homebrewRepoUrl as any).match(GITHUB_REPO_URL_REGEX).slice(2)
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/Formula/${opts.name}.rb`
      const config: AxiosRequestConfig = { headers: { authorization: `token ${opts.accessToken}` } }

      let existingSha: string | null = null
      try {
        const existingFormula = await http.get<{ sha: string }>(url, config)
        existingSha = existingFormula.sha
      } catch (err) {
        if ((err as HttpException).code === 404) {
          // The file doesn't exist yet, which is fine
        }
      }

      const data: { content: string, message: string, sha?: string } = {
        content: Buffer.from(formula).toString('base64'),
        message: 'New Homebrew release from todd'
      }
      if (existingSha) {
        data.sha = existingSha
      }

      await http.put(url, data, config)

      say(`Hurray! ${opts.name} has been successfully deployed to Homebrew and can be installed with:`, 'success')
      console.log('')
      console.log(`
      ${green(`brew tap ${owner}/${opts.name}`)}
      ${green(`brew install ${opts.name}`)}
      `)
      console.log()
    }
  })
