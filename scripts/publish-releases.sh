#!/usr/bin/env bash
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

packages=("core" "webhooks" "auth" "graphql")

for i in ${!packages[@]};
do
  package=${packages[$i]}
  echo "Running npm publish for $package" 
  cd dist/packages/$package && npm publish --access public  && cd - && true
done

echo "Finished..."
