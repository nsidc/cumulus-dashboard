#!/bin/bash
set -e

# Required environment variables in bamboo:
#
# AWS_DEFAULT_REGION=${bamboo.AWS_DEFAULT_REGION}
# AWS_PROFILE=${bamboo.AWS_PROFILE}
# AWS_PROFILE=${bamboo.AWS_PROFILE}
# AWS_SECRET_ACCESS_KEY=${bamboo.AWS_SECRET_ACCESS_KEY}
# AWS_SECRET_ACCESS_KEY_ID=${bamboo.AWS_SECRET_ACCESS_KEY_ID}
# DEPLOY_NAME=${bamboo.DEPLOY_NAME}
# MATURITY=${bamboo.MATURITY}

echo "Creating aws/credentials..."
mkdir aws
cat << EOF > aws/credentials
[${AWS_PROFILE}]
aws_access_key_id = ${AWS_SECRET_ACCESS_KEY_ID}
aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}
region = ${AWS_DEFAULT_REGION}
EOF

echo "Building Docker image..."
docker build -t cumulus-dashboard:nsidc cumulus-dashboard

echo "Syncing..."
docker run \
    --rm \
    --env AWS_SHARED_CREDENTIALS_FILE=/dashboard/aws/credentials \
    --env AWS_PROFILE=${AWS_PROFILE} \
    --volume $(pwd)/aws:/dashboard/aws \
    --volume $(pwd)/dist:/dashboard/dist \
    cumulus-dashboard:nsidc \
    bash -c "aws s3 sync --delete dist s3://${DEPLOY_NAME}-cumulus-${MATURITY}-dashboard"
