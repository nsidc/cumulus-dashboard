#!/bin/bash
set -e

VAR_FILE=inject_vars.txt

cd cumulus-dashboard
git fetch --tags
TAG=$(git describe --tags --abbrev=0)
COMMIT=$(git rev-parse --short HEAD)
cd -

RELEASE_VERSION_NAME=${TAG}-${COMMIT}

set -x

echo RELEASE_VERSION_NAME=${RELEASE_VERSION_NAME} >> ${VAR_FILE}
