
cd "$(dirname "$0")"
cd ..
root_path=$PWD
lugiacomplie="$root_path/node_modules/.bin/lugia-complie"
lerna="$root_path/node_modules/.bin/lerna"
cd "$root_path"
yarn config set registry https://192.168.102.79:5001/
yarn config get registry
$lerna bootstrap "$@"
cd "$root_path"/packages/lugiax-core
$lugiacomplie build
