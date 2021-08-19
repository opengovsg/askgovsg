#!/bin/bash
set -x
pip install awscli-local
awslocal s3 mb s3://$FILE_BUCKET_NAME
awslocal s3api put-bucket-acl --bucket $FILE_BUCKET_NAME --acl public-read
set