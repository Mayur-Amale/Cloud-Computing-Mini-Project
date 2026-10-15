# AWS setup for Student Drive

The CloudFormation stack is at `aws/student-drive-stack.yaml`. It creates:

- A private, encrypted S3 bucket with public access blocked and browser CORS for the local app on ports 3000 and 3001.
- The `StudentDrive_Main` DynamoDB table and the four GSIs used by the backend. The table uses on-demand billing.
- A Cognito User Pool, a public web app client, and `Students` and `Faculty` groups.
- A least-privilege IAM managed policy for the backend to read/write this table and upload/read these S3 objects.

It does not create a public website, EC2 instance, Lambda function, IAM user, or access key. The current app still needs its login screen connected to Cognito before AWS mode can be used from the browser.

## Deploy from the AWS Console

1. Sign in to the AWS account you intend to use. Select **Asia Pacific (Mumbai), `ap-south-1`** for the console region so it matches the project’s default region recommendation.
2. In **CloudFormation**, choose **Create stack → With new resources (standard)**.
3. Upload `student-drive-stack.yaml` as the template, name the stack `student-drive-demo`, and proceed through the screens.
4. Review the resource list and IAM capability acknowledgement. The stack creates cloud resources and may incur charges; check the current [S3](https://aws.amazon.com/s3/pricing/), [DynamoDB](https://aws.amazon.com/dynamodb/pricing/), and [Cognito](https://aws.amazon.com/cognito/pricing/) pricing before submitting.
5. Wait for `CREATE_COMPLETE`. Open the stack’s **Outputs** tab and keep the region, bucket name, table name, User Pool ID, app client ID, and runtime policy ARN. These identifiers are not passwords or access keys, but don’t share any credentials or user passwords.

If CloudFormation reports that the stack requires IAM capabilities, acknowledge the displayed IAM resource capability. The template creates a managed policy only; it does not attach the policy to a user or role.

## After the stack is ready

1. Configure a backend identity using AWS IAM Identity Center or another approved role-based credential flow, and attach the stack’s `RuntimePolicyArn` to that backend identity. Don’t paste access keys into `index.html`, commit credentials, or send them in chat.
2. Set the backend environment values from the stack outputs: `STORAGE_MODE=aws`, `AUTH_MODE=cognito`, `AWS_REGION=ap-south-1`, `DYNAMODB_TABLE=StudentDrive_Main`, `S3_BUCKET=<bucket output>`, `COGNITO_USER_POOL_ID=<pool output>`, and `COGNITO_CLIENT_ID=<client output>`.
3. Replace the demo role switcher with Cognito sign-in. Create each Cognito account as an administrator, set its `custom:roll_no`, and add it to either `Students` or `Faculty`. Seed or create a matching user profile in DynamoDB before signing in; the API checks that the token identity and stored role agree.
4. Seed the sample courses and assignments with `node scripts/setup-dynamodb.js` after AWS credentials and environment values are configured. This script is idempotent for existing records; it won’t replace records already in the table.
5. Only then start the app in AWS mode and check health, API sync, a private S3 upload, and a teacher review. The browser should use the app’s actual origin; add that origin to the bucket CORS rules when deploying somewhere other than localhost.

Until the Cognito login integration is complete, keep running the app in local mode. The generated stack itself does not switch the running app to AWS.
