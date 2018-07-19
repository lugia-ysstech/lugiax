
cd "$(dirname "$0")"

# Go to root
cd ..
root_path=$PWD
$lugia-complie="$root_path/node_modules/.bin/lugia-complie"

cd "$root_path/packages/lugiax-core"
$lugia-complie dev --ig & lugia-complie test --watchAll
