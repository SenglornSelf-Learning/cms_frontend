import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const defaultSleekRoot = path.resolve(projectRoot, '../../sleek-bootstrap-main')
const dest = path.join(projectRoot, 'public/theme')

/** Resolve unzip nesting: `sleek-bootstrap-main/sleek-bootstrap-main/theme`. */
function resolveSleekRoot(candidate) {
  if (fs.existsSync(path.join(candidate, 'theme'))) {
    return candidate
  }
  const nested = path.join(candidate, 'sleek-bootstrap-main')
  if (fs.existsSync(path.join(nested, 'theme'))) {
    return nested
  }
  return candidate
}

function hasVendoredTheme() {
  return (
    fs.existsSync(path.join(dest, 'assets/css/sleek.css')) ||
    fs.existsSync(path.join(dest, 'assets/js/sleek.js'))
  )
}

const sleekRoot = resolveSleekRoot(process.env.SLEEK_THEME_ROOT ?? defaultSleekRoot)
const themeSrc = path.join(sleekRoot, 'theme')
const simplebarSrc = path.join(sleekRoot, 'source/assets/plugins/simplebar')

if (!fs.existsSync(themeSrc)) {
  if (hasVendoredTheme()) {
    console.log(
      `Sleek source not found at "${themeSrc}". Using vendored theme in public/theme.`,
    )
    process.exit(0)
  }
  console.error(
    `Sleek theme not found at "${themeSrc}" and public/theme is missing.\n` +
      'Either restore public/theme from git, or set SLEEK_THEME_ROOT and run: npm run sync:theme',
  )
  process.exit(1)
}

fs.cpSync(themeSrc, dest, { recursive: true, force: true })

if (fs.existsSync(simplebarSrc)) {
  fs.cpSync(simplebarSrc, path.join(dest, 'assets/plugins/simplebar'), {
    recursive: true,
    force: true,
  })
} else {
  console.warn(`Warning: simplebar assets missing at "${simplebarSrc}"`)
}

console.log(`Synced Sleek theme → ${dest}`)
