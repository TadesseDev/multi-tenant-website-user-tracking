#!/bin/bash
echo "Creating SQS queue..."
awslocal sqs create-queue \
  --queue-name event-ingestion \
  --region us-east-1 \
  --attributes VisibilityTimeout=30,MessageRetentionPeriod=86400
echo "Done. Queues:"
awslocal sqs list-queues
