cd "$(dirname "$0")"
cd ..

set -x

lerna run test
