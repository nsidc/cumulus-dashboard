#!/bin/bash
set -e

# Required environment variables in bamboo:
#
# DAAC_NAME=${bamboo.DAAC_NAME}
# ESROOT_SIT=${bamboo.ESROOT_SIT}
# HIDE_PDR=${bamboo.HIDE_PDR}
# KIBANAROOT_SIT=${bamboo.KIBANAROOT_SIT}
# LABELS=${bamboo.LABELS}
# SERVED_BY_CUMULUS_API=${bamboo.SERVED_BY_CUMULUS_API}

mkdir -p artifacts

tar -cvzf artifacts/cumulus-dashboard-src.tar.gz cumulus-dashboard

docker build -t cumulus-dashboard:nsidc cumulus-dashboard

for stage in development SIT UAT PROD; do
    APIROOT_VAR=APIROOT_${stage}
    APIROOT=${!APIROOT_VAR}

    KIBANAROOT_VAR=KIBANAROOT_${stage}
    KIBANAROOT=${!KIBANAROOT_VAR}

    ESROOT_VAR=ESROOT_${stage}
    ESROOT=${!ESROOT_VAR}

    docker run \
        --rm \
        --volume $(pwd)/artifacts:/artifacts \
        cumulus-dashboard:nsidc \
        bash -c "set -x; echo KIBANAROOT=${KIBANAROOT} ESROOT=${ESROOT}; APIROOT=${APIROOT} STAGE=${stage} SERVED_BY_CUMULUS_API=${SERVED_BY_CUMULUS_API} DAAC_NAME=${DAAC_NAME} HIDE_PDR=${HIDE_PDR} LABELS=${LABELS} npm run build;\
                 tar -cvzf /artifacts/cumulus-dashboard-dist-${stage}.tar.gz dist"
done
