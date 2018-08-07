cd ..
cd ..
root_path=$PWD
echo "$root_path"

lugiac="$root_path/node_modules/.bin/lugia-complie"

cd "$root_path"/packages/lugiax-core
$lugiac dev --ig
