const { task, series, src, dest } = require('gulp');
const gulpClean = require('gulp-clean');
const rename = require('gulp-rename');
const svg2png = require('gulp-svg2png');
const { spawn } = require('child_process');

function clean() {
  return src('build/**/*', { read: false }).pipe(gulpClean());
}

function buildReact() {
  return spawn('npx', ['react-scripts', 'build'], { stdio: 'inherit' });
}

function buildIcon() {
  return src('./graphics/logo_original.svg')
    .pipe(
      svg2png({
        width: 512,
        height: 512,
      }),
    )
    .pipe(rename('icon.png'))
    .pipe(dest('./build'));
}

task('clean', clean);
task('build:icon', buildIcon);
task('build:react', buildReact);

const build = series(buildReact, buildIcon);

exports.default = series(clean, build);
