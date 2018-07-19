
cd "$(dirname "$0")"

# Go to root
cd ..
root_path=$PWD
$lugia-complie="$root_path/node_modules/.bin/lugia-complie"

ruban="$root_path/node_modules/.bin/ruban"

umdBundler="$root_path/node_modules/.bin/umd-bundler"
uglifyjs="$root_path/node_modules/.bin/uglifyjs"
lerna="$root_path/node_modules/.bin/lerna"

cd "$root_path/packages/dva-core"
$ruban build
echo 'build dva-core'
