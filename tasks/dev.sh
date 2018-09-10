root_path=$PWD
echo "$root_path"

lugiacomplie="$root_path/node_modules/.bin/lugia-complie"

cd "$root_path"/packages/lugiax-core
$lugiacomplie dev --ig &

cd "$root_path"/packages/lugiax-router
$lugiacomplie dev --ig &

cd "$root_path"/packages/lugiax
$lugiacomplie dev --ig &
