import * as core from 'monocdk';
import * as s3 from 'monocdk/aws-s3';
import * as s3deploy from 'monocdk/aws-s3-deployment';

export interface WebsiteProps extends core.StackProps {}

export class Website extends core.Stack {
  constructor(scope: core.Construct, id: string, props?: WebsiteProps) {
    super(scope, id, props);

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
    });

    const grant = websiteBucket.grantPublicAccess();
    grant.resourceStatement!.addCondition('IpAddress', {
      'aws:SourceIp': core.SecretValue.secretsManager('source-ip-address'),
    });

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../website/build')],
      destinationBucket: websiteBucket,
    });
  }
}
