
cd "$(dirname "$0")"

cd ..
root_path=$PWD
$lugia-complie="$root_path/node_modules/.bin/lugia-complie"
lerna="$root_path/node_modules/.bin/lerna"

cd "$root_path"
$lerna bootstrap "$@"
