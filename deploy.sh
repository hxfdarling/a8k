#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist


git init
git add .
git commit -m 'chore: deploy'


git push -f git@github.com:hxfdarling/imt.git docs:gh-pages

cd -