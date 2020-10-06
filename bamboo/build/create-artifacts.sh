#!/bin/bash
set -e

# Required environment variables in bamboo:
#
# APIROOT_PROD=${bamboo.APIROOT_PROD}
# APIROOT_SIT=${bamboo.APIROOT_SIT}
# APIROOT_UAT=${bamboo.APIROOT_UAT}
# APIROOT_development=${bamboo.APIROOT_development}
# DAAC_NAME=${bamboo.DAAC_NAME}
# ESROOT_PROD=${bamboo.ESROOT_PROD}
# ESROOT_SIT=${bamboo.ESROOT_SIT}
# ESROOT_UAT=${bamboo.ESROOT_UAT}
# ESROOT_development=${bamboo.ESROOT_development}
# ES_PASSWORD=${bamboo.ES_PASSWORD}
# ES_USER=${bamboo.ES_USER}
# HIDE_PDR=${bamboo.HIDE_PDR}
# KIBANAROOT_PROD=${bamboo.KIBANAROOT_PROD}
# KIBANAROOT_SIT=${bamboo.KIBANAROOT_SIT}
# KIBANAROOT_UAT=${bamboo.KIBANAROOT_UAT}
# KIBANAROOT_development=${bamboo.KIBANAROOT_development}
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

    if [ ${stage} = "development" ]; then
        cumulus_api=true
    else
        cumulus_api=${SERVED_BY_CUMULUS_API}
    fi

    docker run \
        --rm \
        --volume $(pwd)/artifacts:/artifacts \
        cumulus-dashboard:nsidc \
        bash -c "set -x; npm install; KIBANAROOT=${KIBANAROOT} ESROOT=${ESROOT} ES_USER=${ES_USER} ES_PASSWORD=${ES_PASSWORD} APIROOT=${APIROOT} STAGE=${stage} SERVED_BY_CUMULUS_API=${cumulus_api} DAAC_NAME=${DAAC_NAME} HIDE_PDR=${HIDE_PDR} LABELS=${LABELS} npm run build;\
                 tar -cvzf /artifacts/cumulus-dashboard-dist-${stage}.tar.gz dist"
done
