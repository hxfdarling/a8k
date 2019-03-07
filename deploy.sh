#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist


git init
git add -A
git commit -m 'chore: deploy'


git push -f https://${GITHUB_TOKEN}@github.com/hxfdarling/a8k.git master:gh-pages

cd -