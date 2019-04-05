# 调试详情

## 调试方法

```shell
git clone https://github.com/hxfdarling/a8k.git
cd a8k          # 进入目录
npm i           # 安装依赖
npm i -g lerna  # 安装包管理工具
lerna bootstrap # 安装依赖

npm run link

cd packages/a8k
npm run dev     # 开启调试
npm link
npm run build   # 编译生成对应文件

# 在 a8k src 文件内，任意修改一个文件加入
console.log('a8k');

# 新建打开，一个命令行工具
# 输入 k
# terminal 中会展示 a8k 字符串

```
