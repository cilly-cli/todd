const titleCase = (str: string): string => str[0].toUpperCase() + str.slice(1)

export const formulaTemplate = (opts: {
  description: string,
  homepage: string,
  download: string,
  checksum: string,
  version: string,
  binary: string
}): string => `
class ${titleCase(opts.binary)} < Formula
  url "${opts.download}"
  desc "${opts.description}"
  version "${opts.version}"
  homepage "${opts.homepage}"
  sha256 "${opts.checksum}"

  def install
    bin.install "${opts.binary}"
  end
end
`