#!/usr/bin/env bash
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

usage() {
  echo "Publish all packages."
  echo
  echo "Usage: $(basename $0) --version <version>"
  echo "Options:"
  echo
  echo "  --help"
  echo "      This help text."
  echo
  echo "  --version <version>"
  echo "      NPM version to bump."
  echo
  echo "Example:"
  echo "    ./prepare-release.sh --version 1.0.0"
  echo
}

while [ "$#" -gt 0 ]
do
  case "$1" in
  --help)
    usage
    exit 0
    ;;
  --version)
    version="$2"
    ;;
  --)
    shift
    break
    ;;
  -*)
    echo "Invalid option '$1'. Use --help to see the valid options." >&2
    exit 1
    ;;
  # an option argument, continue
  *)
    ;;
  esac
  shift
done

if [ -z "${version:-}" ]
then
  echo "--version is required. Use --help to see the valid options." >&2
  exit 1
fi

packages=("core" "webhooks" "auth" "graphql")

for i in ${!packages[@]};
do
  package=${packages[$i]}
  echo "Running npm version $version for $package" 
  cd packages/$package && npm version $version  && cd -
done

echo "Building packages to copy to dist with new versions"
npx nx run-many --target=build --all
