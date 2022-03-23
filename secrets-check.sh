#!/bin/sh

against=HEAD

# Redirect output to stderr.
exec 1>&2

# Check changed files for an AWS keys
KEY_ID=$(git diff --cached --name-only -z $against | xargs -0 cat | perl -nle'print $& if m{(?<![A-Z0-9])[A-Z0-9]{20}(?![A-Z0-9])}')
KEY=$(git diff --cached --name-only -z $against | xargs -0 cat | perl -nle'print $& if m{(?<![A-Za-z0-9/+=])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])}')

if [ "$KEY_ID" != "" -o "$KEY" != "" ]; then
    echo "Please check your code:"
    if [ "$KEY_ID" != "" ]; then
        echo "Found AWS_ACCESS_KEY_ID: $KEY_ID"
    fi
    if [ "$KEY" != "" ]; then
        echo "Found AWS_SECRET_ACCESS_KEY: $KEY"
    fi
    exit 1
fi

# Normal exit
exit 0
