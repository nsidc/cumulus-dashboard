This file contains instructions for standing up a local instance of
cumulus-dashboard to talk to the NSIDC Sandbox instance of Cumulus.

# Variables

When following the steps below, these "variables" need to be substitued with
their actual values (i.e., you can't just set them as environment variables).

* `API_SUBDOMAIN` - can be retrieved from the [AWS
  Console](https://us-west-2.console.aws.amazon.com/apigateway/main/apis?region=us-west-2);
  choose the `${PREFIX}-archive` API, then click "Dashboard", and this text will
  be near the top of the screen: `Invoke this API at:
  https://${API_SUBDOMAIN}.execute-api.us-west-2.amazonaws.com/sbx/`
* `INSTANCE_ID` - the ID of the EC2 instance named
  `${PREFIX}-CumulusECSCluster`, can be retrived from the [AWS Console, EC2
  Instances
  page](https://us-west-2.console.aws.amazon.com/ec2/v2/home?region=us-west-2#Instances:sort=instanceId).
* `LOCAL_PORT` - port on your local machine to use for the tunnel to the EC2
  instance. Can be any valid open port. The important thing is to use the same
  port in steps 3 and 4.
* `EC2_KEY` - path to the private key (`.pem`) that can be used to access the
  EC2 Instance. It corresponds to a public key found on the [AWS Console Key
  pairs
  page](https://us-west-2.console.aws.amazon.com/ec2/v2/home?region=us-west-2#KeyPairs:).

# Steps

Steps 1-4 are essentially the same as [the steps on the Earthdata
Wiki](https://wiki.earthdata.nasa.gov/display/CUMULUS/Accessing+Cumulus+APIs+via+SSM).

## 1. Connect to NASA VPN

## 2. Add this line to your `/etc/hosts`
```
127.0.0.1       ${API_SUBDOMAIN}.execute-api.us-west-2.amazonaws.com
```

* Pulse modifies this file when connecting, so you need to ensure this line is
  present *after* Step 1

## 3. Create local port forward

Run:
```
aws ssm start-session --target ${INSTANCE_ID} --document-name AWS-StartPortForwardingSession --parameters portNumber=22,localPortNumber=${LOCAL_PORT}
```
* there is a one-time step of attaching the IAM role
  `NGAPShInstanceS3AccessRole` to the EC2 instance; if the above command fails,
  check in the [AWS
  Console](https://us-west-2.console.aws.amazon.com/ec2/v2/home?region=us-west-2#Instances:sort=instanceId)
  that the EC2 instance has the role attached, and review the steps on the
  Earthdata wiki if necessary

## 4. Create tunnel

In a new shell, run:
```
ssh -p ${LOCAL_PORT} -L 8000:${API_SUBDOMAIN}.execute-api.us-west-2.amazonaws.com:443 -i ${EC2_KEY} ec2-user@127.0.0.1 -N
```

* Optionally, `-N` can be replaced by a command to keep the connection open,
  such as `"while true; do echo 'awake nsidc-sb tunnel'; sleep 60 ; done"`
* Add `-v` (or `-vv` or `-vvv`) to get some debugging output

## 5. Start the dev server for the cumulus-dashboard. This can be done directly via `npm` commands, or it can be done with Docker.

After starting the dev server with either of these options, source can be edited
locally and webpack will restart the server.

The processes in 3 and 4 need to keep running so it's easiest to do one of the
following in a new shell.

### Docker

There are also instructions in `README.md` for running locally in Docker, but
the instructions here are even simpler.

Requirements:

* [Docker](https://www.docker.com/products/docker-desktop)

Run:

```
export APIROOT=https://${API_SUBDOMAIN}.execute-api.us-west-2.amazonaws.com:8000/sbx/
docker-compose up
```

### npm

Requirements:

* [Node 10](https://nodejs.org/en/) (recommended to install via
  [nvm](https://github.com/nvm-sh/nvm))
* npm (installed with Node)

Run:

```
nvm use
npm install # install dependencies
APIROOT=https://${API_SUBDOMAIN}.execute-api.us-west-2.amazonaws.com:8000/sbx/ npm run serve
```

## 6. Navigate to http://localhost:3000 in your browser, log in via EDL
