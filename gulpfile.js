const gulp = require('gulp');
const htmlmin = require('htmlmin');
const cleanCss = require('clean-css');
const uglify = require('gulp-uglify-es').default;
const del = require('del');
const pump =require('pump');
const runSequence = require('run-sequence');

