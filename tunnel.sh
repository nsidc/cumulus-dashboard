#!/bin/bash

AWS_PROFILE=sandbox
LOCAL_PORT=6789
EC2_KEY=~/.ssh/nsidc-sb.pem
PREFIX=nsidc-cumulus-sbx

API_SUBDOMAIN=$(aws --profile=${AWS_PROFILE} apigateway get-rest-apis | jq -r ".[] | map(select(.name == \"${PREFIX}-archive\")) | .[].id")

HOST=${API_SUBDOMAIN}.execute-api.us-west-2.amazonaws.com

if ! grep -E "^127.0.0.1\s*${HOST}$" /etc/hosts > /dev/null
then
    echo -e "Add the following line to /etc/hosts and try again:\n"
    echo -e "127.0.0.1\t${HOST}"
    exit 1
fi

INSTANCE_ID=$(aws --profile=${AWS_PROFILE} ec2 describe-instances --max-items 1 --filters "Name=tag-value,Values=${PREFIX}-CumulusECSCluster" "Name=instance-state-name,Values=running" | jq -r '.Reservations[0].Instances[0].InstanceId')

echo "Opening tunnel with values:"
echo "AWS_PROFILE=${AWS_PROFILE}"
echo "LOCAL_PORT=${LOCAL_PORT}"
echo "EC2_KEY=${EC2_KEY}"
echo "HOST=${HOST}"
echo "PREFIX=${PREFIX}"

PRIOR_SESSION_IDS=$(aws --profile=${AWS_PROFILE} ssm describe-sessions \
                        --state Active \
                        --filters key=Target,value=${INSTANCE_ID} \
                        --query 'Sessions[*].SessionId' \
                        --output text)

aws --profile=${AWS_PROFILE} ssm start-session \
    --target ${INSTANCE_ID} \
    --document-name AWS-StartPortForwardingSession \
    --parameters portNumber=22,localPortNumber=${LOCAL_PORT} &

sleep 5

SESSION_IDS=$(aws --profile=${AWS_PROFILE} ssm describe-sessions \
                  --state Active \
                  --filters key=Target,value=${INSTANCE_ID} \
                  --query 'Sessions[*].SessionId' \
                  --output text)

function cleanup() {
    echo ""
    for SESSION_ID in ${SESSION_IDS}; do
        if [[ "${PRIOR_SESSION_IDS}" =~ "${SESSION_ID}" ]]; then
            echo ""
        else
            echo "Cleaning up ssm session ${SESSION_ID}"
            aws --profile=${AWS_PROFILE} ssm terminate-session --session-id "${SESSION_ID}" > /dev/null
        fi
    done
    exit 0
}

trap cleanup SIGINT

echo ""
echo "This script uses \`sudo ssh\` to bind your host's port 443 to port 443 on the SSM host."
echo "You may be prompted for your password."
read -p "Press ^C to exit, or Enter to continue. " continue

sudo ssh -f -N -p ${LOCAL_PORT} -L 443:${HOST}:443 -i ${EC2_KEY} ec2-user@127.0.0.1

echo ""
sleep 1
echo ""
echo "Open the following URL in your browser to access the dashboard:"
echo "https://${HOST}/sbx/dashboard/${PREFIX}-dashboard/index.html"
echo ""
echo "Press ^C to close the tunnel."

sleep 86400
