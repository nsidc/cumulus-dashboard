#!/bin/bash

AWS_PROFILE=sandbox
LOCAL_PORT=6789
EC2_KEY=~/.ssh/nsidc-sb.pem
PREFIX=nsidc-cumulus-dev

API_SUBDOMAIN=$(aws --profile=${AWS_PROFILE} apigateway get-rest-apis | jq -r ".[] | map(select(.name == \"${PREFIX}-archive\")) | .[].id")

HOST=${API_SUBDOMAIN}.execute-api.us-west-2.amazonaws.com

if ! grep -E "^127.0.0.1\s*${HOST}$" /etc/hosts > /dev/null
then
    echo -e "Add the following line to /etc/hosts and try again:\n"
    echo -e "127.0.0.1\t${HOST}"
    exit 1
fi

INSTANCE_ID=$(aws --profile=${AWS_PROFILE} ec2 describe-instances --max-items 1 --filters "Name=tag-value,Values=${PREFIX}-CumulusECSCluster" | jq -r '.Reservations[0].Instances[0].InstanceId')

echo "Opening tunnel with values:"
echo "AWS_PROFILE=${AWS_PROFILE}"
echo "LOCAL_PORT=${LOCAL_PORT}"
echo "EC2_KEY=${EC2_KEY}"
echo "HOST=${HOST}"
echo "PREFIX=${PREFIX}"

aws --profile=${AWS_PROFILE} ssm start-session \
    --target ${INSTANCE_ID} \
    --document-name AWS-StartPortForwardingSession \
    --parameters portNumber=22,localPortNumber=${LOCAL_PORT} > backingfile &

sleep 5

exec 3< backingfile
rm backingfile

read <&3 line
SESSION_ID=$(read <&3 line | awk '{print $5}')

ssh -p ${LOCAL_PORT} -L 8000:${HOST}:443 -i ${EC2_KEY} ec2-user@127.0.0.1 -N &

URL=https://${HOST}:8000/dev/dashboard/${PREFIX}-dashboard/index.html
echo "URL=${URL}"

function cleanup() {
    aws --profile=${AWS_PROFILE} ssm terminate-session --session-id "${SESSION_ID}"
}

trap cleanup SIGINT

sleep 86400
