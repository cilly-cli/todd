import { CliCommand } from 'cilly'
import { readFileSync } from 'fs'
import { getMissingPropertyPath } from '../../../utils'
import { PackerOptions } from '../packer'

interface MacOsPackerOptions extends PackerOptions {
  identifier: string
  signature: string
}

const loadRc = (path: string): MacOsPackerOptions => {
  const rc = JSON.parse(readFileSync(path).toString()) as { macos: MacOsPackerOptions }
  const missingProperty = getMissingPropertyPath(rc, {
    'macos': {
      'identifier': null,
      'signature': null
    }
  })

  if (missingProperty) {
    throw new Error(`The property "${missingProperty}" is missing from ${path}.`)
  }

  return rc.macos
}

const handleMacOsPacker = (args, opts: MacOsPackerOptions): void => {
  opts = { ...opts, ...loadRc(opts.runConfig) }
  console.log(opts)
}

export const macos = new CliCommand('macos', { inheritOpts: true })
  .withDescription('Package an executable as a macOS installer')
  .withOptions(
    {
      name: ['-s', '--signature'], description: 'The signature to use for signing this package', args: [
        { name: 'sig', required: true }
      ]
    },
    {
      name: ['-i', '--identifier'], description: 'The identifier for this package, e.g. com.todd.cli', args: [
        { name: 'id', required: true }
      ]
    }
  )
  .withHandler(handleMacOsPacker)

/** NOTES
 * We can use pkgbuild and productbuild (builtin MacOS CLI tools) to
 * package files (e.g. an executable) into a .pkg installer.
 * We can also use the tools to sign the package so it doesn't look like a virus.
 * For example:
 *
 * pkgbuild --root ~/dev/abrams/test-installer        # Path to the executable and other files
    --identifier com.cilly.cli                        # Identifier
    --version 1.0.1                                   # Semver
    --install-location /usr/local/lib/test-installer  # DON'T install under ~/. Not with a gun to your head. Internet says this causes problems.
    --scripts ./__tmp_scripts/                        # Path to the [pre|post|un]install scripts (bash) that the installer will run.
                                                      # Remember to chmod these with 0o755.
    --sign "Anders Brams (todd)"                      # Name of the signing identity
    --keychain $OSX_KEYCHAIN                          # Keychain to search to signing identity
    installer-test.pkg                                # Output destination of the .pkg installer


  Before throwing this is production, look into how productbuild can help smooth out things.
 */
