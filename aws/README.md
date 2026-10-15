# AWS setup for Student Drive

The CloudFormation stack is at `aws/student-drive-stack.yaml`. It creates:

- A private, encrypted S3 bucket with public access blocked and browser CORS for the local app on ports 3000 and 3001.
- The `StudentDrive_Main` DynamoDB table and the four GSIs used by the backend. The table uses on-demand billing.
- A Cognito User Pool, a public web app client, and `Students` and `Faculty` groups.
- A least-privilege IAM managed policy for the backend to read/write this table and upload/read these S3 objects.

It does not create a public website, EC2 instance, Lambda function, IAM user, or access key. The app includes a Cognito sign-in flow, but it still needs local configuration, seeded portal data, and a Cognito student/faculty account before AWS mode is usable.

## Deploy from the AWS Console

1. Sign in to the AWS account you intend to use. Select **Asia Pacific (Mumbai), `ap-south-1`** for the console region so it matches the project’s default region recommendation.
2. In **CloudFormation**, choose **Create stack → With new resources (standard)**.
3. Upload `student-drive-stack.yaml` as the template, name the stack `student-drive-demo`, and proceed through the screens.
4. Review the resource list and IAM capability acknowledgement. The stack creates cloud resources and may incur charges; check the current [S3](https://aws.amazon.com/s3/pricing/), [DynamoDB](https://aws.amazon.com/dynamodb/pricing/), and [Cognito](https://aws.amazon.com/cognito/pricing/) pricing before submitting.
5. Wait for `CREATE_COMPLETE`. Open the stack’s **Outputs** tab and keep the region, bucket name, table name, User Pool ID, app client ID, and runtime policy ARN. These identifiers are not passwords or access keys, but don’t share any credentials or user passwords.

If CloudFormation reports that the stack requires IAM capabilities, acknowledge the displayed IAM resource capability. The template creates a managed policy only; it does not attach the policy to a user or role.

## After the stack is ready

1. Configure a backend identity using AWS IAM Identity Center or another approved role-based credential flow, and attach the stack’s `RuntimePolicyArn` to that backend identity. Don’t paste access keys into `index.html`, commit credentials, or send them in chat.
2. Copy `.env.example` to `.env`, then set `AWS_PROFILE=student-drive` and copy the User Pool ID and App Client ID from the stack outputs. The example already contains the deployed bucket, table, and region values. The backend loads `.env` at startup; `.env` is git-ignored.
3. Create a Cognito student or faculty user. Set `custom:roll_no` to a profile ID in the seeded portal data (`CS-2023-084` for the demo student or `FAC-CSE-042` for the demo faculty) and add the user to the matching `Students` or `Faculty` group. The app can complete Cognito's first-login temporary-password challenge; other challenges such as MFA are not implemented yet.
4. Run `node scripts/setup-dynamodb.js` from the project folder in a terminal with the configured IAM Identity Center session. The script seeds sample profiles, subjects, assignments, and submissions without replacing existing records.
5. Start the app with the `.env` values loaded, sign in through Cognito, then verify the AWS API sync and a private S3 upload. The browser should use the app's actual origin; add that origin to the bucket CORS rules when deploying somewhere other than localhost.

Do not switch the app to AWS mode until `.env`, DynamoDB seed data, a matching Cognito account, and the AWS SSO profile are all ready. The CloudFormation stack itself does not change the running app.
