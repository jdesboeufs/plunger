function getDigestString(digest, algorithm = 'sha384') {
  if (!digest) return ''
  return `${algorithm}-${digest}`
}

module.exports = {getDigestString}
