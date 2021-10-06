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
# ES_CLOUDWATCH_TARGET_PATTERN_PROD=${bamboo.ES_CLOUDWATCH_TARGET_PATTERN_PROD}
# ES_CLOUDWATCH_TARGET_PATTERN_SIT=${bamboo.ES_CLOUDWATCH_TARGET_PATTERN_SIT}
# ES_CLOUDWATCH_TARGET_PATTERN_UAT=${bamboo.ES_CLOUDWATCH_TARGET_PATTERN_UAT}
# ES_DISTRIBUTION_TARGET_PATTERN_PROD=${bamboo.ES_DISTRIBUTION_TARGET_PATTERN_PROD}
# ES_DISTRIBUTION_TARGET_PATTERN_SIT=${bamboo.ES_DISTRIBUTION_TARGET_PATTERN_SIT}
# ES_DISTRIBUTION_TARGET_PATTERN_UAT=${bamboo.ES_DISTRIBUTION_TARGET_PATTERN_UAT}
# ES_PASSWORD_PROD=${bamboo.ES_PASSWORD_PROD}
# ES_PASSWORD_SIT=${bamboo.ES_PASSWORD_SIT}
# ES_PASSWORD_UAT=${bamboo.ES_PASSWORD_UAT}
# ES_PASSWORD_development=${bamboo.ES_PASSWORD_development}
# ES_USER_PROD=${bamboo.ES_USER_PROD}
# ES_USER_SIT=${bamboo.ES_USER_SIT}
# ES_USER_UAT=${bamboo.ES_USER_UAT}
# ES_USER_development=${bamboo.ES_USER_development}
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

    ES_USER_VAR=ES_USER_${stage}
    ES_USER=${!ES_USER_VAR}

    ES_PASSWORD_VAR=ES_PASSWORD_${stage}
    ES_PASSWORD=${!ES_PASSWORD_VAR}


    ES_CLOUDWATCH_TARGET_PATTERN_VAR=ES_CLOUDWATCH_TARGET_PATTERN_${stage}
    ES_CLOUDWATCH_TARGET_PATTERN=${!ES_CLOUDWATCH_TARGET_PATTERN_VAR}

    ES_DISTRIBUTION_TARGET_PATTERN_VAR=ES_DISTRIBUTION_TARGET_PATTERN_${stage}
    ES_DISTRIBUTION_TARGET_PATTERN=${!ES_DISTRIBUTION_TARGET_PATTERN_VAR}

    if [ ${stage} = "development" ]; then
        cumulus_api=true
        AUTH_METHOD=earthdata
    else
        cumulus_api=${SERVED_BY_CUMULUS_API}
        AUTH_METHOD=launchpad
    fi

    docker run \
        --rm \
        --volume $(pwd)/artifacts:/artifacts \
        cumulus-dashboard:nsidc \
        bash -c "set -x; KIBANAROOT=${KIBANAROOT} ESROOT=${ESROOT} ES_USER=${ES_USER} ES_PASSWORD=${ES_PASSWORD} ES_CLOUDWATCH_TARGET_PATTERN=${ES_CLOUDWATCH_TARGET_PATTERN} ES_DISTRIBUTION_TARGET_PATTERN=${ES_DISTRIBUTION_TARGET_PATTERN} APIROOT=${APIROOT} STAGE=${stage} SERVED_BY_CUMULUS_API=${cumulus_api} DAAC_NAME=${DAAC_NAME} HIDE_PDR=${HIDE_PDR} LABELS=${LABELS} AUTH_METHOD=${AUTH_METHOD} npm run build;\
                 tar -cvzf /artifacts/cumulus-dashboard-dist-${stage}.tar.gz dist"
done
