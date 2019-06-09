#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

if [[ $TRAVIS_TAG =~ beta ]]; then
    # 发布预发布版本
    npm run lerna:publish:beta
    # 发布正式版本
else
    npm run lerna:publish
fi
