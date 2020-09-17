#!/bin/bash -e

USER="$(id -un)" # $USER empty in vscode terminal
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"
RSYNC_TESTS="rsync -havz --no-perms --progress --delete --include=/test --include=*.test.ts --include=*.test.tsx --exclude-from=$DIR/.rsync-ignore"
RSYNC="rsync -havz --no-perms --progress --delete --delete-excluded --exclude-from=$DIR/.rsync-ignore"

ROOT="/home/owid"
NAME="$1"

if [[ "$NAME" =~ ^(staging|hans|playfair|jefferson|nightingale|explorer|exemplars|tufte|roser)$ ]]; then
  HOST="owid@165.22.127.239"
elif [ "$NAME" == "live" ]; then
  HOST="owid@209.97.185.49"

  if [ "$(git rev-parse --abbrev-ref HEAD)" != "master" ]; then
    echo "Please run from the master branch."
    exit 1
  else
    # Making sure we have the latest changes from the upstream
    # Also, will fail if working copy is not clean
    git pull --rebase
  fi

  # Prompt for confirmation if deploying to live
  read -p "Are you sure you want to deploy to '$NAME'? " -n 1 -r
  echo
  if [[ $REPLY =~ ^[^Yy]$ ]]; then
    exit 0
  fi
else
  echo "Please select either live or a valid test target."
  exit 1
fi


OLD_REPO_BACKUP="$ROOT/tmp/$NAME-old"
SYNC_TARGET="$ROOT/tmp/$NAME-$USER"
SYNC_TARGET_TESTS="$ROOT/tmp/$NAME-tests"
TMP_NEW="$ROOT/tmp/$NAME-$USER-tmp"
FINAL_TARGET="$ROOT/$NAME"
FINAL_DATA="$ROOT/$NAME-data"

GIT_EMAIL="$(git config user.email)"
GIT_NAME="$(git config user.name)"
GIT_HEAD="$(git rev-parse HEAD)"

if [ "$2" == "-r" ]; then
  # Run pre-deploy checks remotely
  $RSYNC_TESTS $DIR/ $HOST:$SYNC_TARGET_TESTS

  ssh -t $HOST 'bash -e -s' <<EOF
  cd $SYNC_TARGET_TESTS
  yarn install --production=false --frozen-lockfile
  yarn testcheck
EOF
elif [ "$2" == "--skip-checks" ] && [ "$NAME" != "live" ]; then
    : # allow skipping checks when deploying to a staging server
else
  # Run pre-deploy check locally
  yarn testcheck
fi


# Write the current commit SHA to public/head.txt so we always know which commit is deployed
echo $GIT_HEAD > public/head.txt

# Ensure tmp/ directory exists
ssh $HOST mkdir -p $ROOT/tmp

# Rsync the local repository to a temporary location on the server
$RSYNC $DIR/ $HOST:$SYNC_TARGET

ssh -t $HOST 'bash -e -s' <<EOF
# Remove any previous temporary repo
rm -rf $TMP_NEW

# Copy the synced repo-- this is because we're about to move it, and we want the
# original target to stay around to make future syncs faster
cp -r $SYNC_TARGET $TMP_NEW

# Link in all the persistent stuff that needs to stay around between versions
ln -sf $FINAL_DATA/.env $TMP_NEW/.env
mkdir -p $FINAL_DATA/bakedSite
ln -sf $FINAL_DATA/bakedSite $TMP_NEW/bakedSite
mkdir -p $FINAL_DATA/datasetsExport
ln -sf $FINAL_DATA/datasetsExport $TMP_NEW/datasetsExport

# Install dependencies, build assets and migrate
cd $TMP_NEW
yarn install --production --frozen-lockfile
yarn build
yarn migrate
yarn tsn algolia/configureAlgolia.ts

# Create deploy queue file writable by any user
touch .queue
chmod 0666 .queue

# Atomically swap the old and new versions
rm -rf $OLD_REPO_BACKUP
mv $FINAL_TARGET $OLD_REPO_BACKUP || true
mv $TMP_NEW $FINAL_TARGET

# Restart the admin
pm2 restart $NAME
pm2 stop $NAME-deploy-queue

# Static build to update the public frontend code
cd $FINAL_TARGET
yarn tsn deploy/bakeSite.ts "$GIT_EMAIL" "$GIT_NAME"

# Restart the deploy queue
pm2 start $NAME-deploy-queue
EOF
