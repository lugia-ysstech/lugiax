
cd "$(dirname "$0")"

# Go to root
cd ..
root_path=$PWD
lugiac="$root_path/node_modules/.bin/lugia-complie"

lerna="$root_path/node_modules/.bin/lerna"

cd "$root_path/packages/lugiax-core"
$lugiac build
echo 'build lugiax-core'

cd "$root_path/packages/lugiax-router"
$lugiac build
echo 'build lugiax-router'

cd "$root_path/packages/lugiax"
$lugiac build
echo 'build lugiax'

cd "$root_path"
$lerna publish "$@/target"
