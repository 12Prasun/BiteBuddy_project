# AWS Deployment Guide for BiteBuddy

## Overview
This guide provides step-by-step instructions for deploying BiteBuddy on AWS using various services.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│         CloudFront CDN                              │
│   (Static Frontend Caching)                         │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│         Application Load Balancer                   │
│   (Route traffic to EC2 instances)                  │
└──────────────┬──────────────────────────────────────┘
               │
       ┌───────┴──────────┐
       │                  │
┌──────▼─────────┐  ┌──────▼─────────┐
│  EC2 Instance  │  │  EC2 Instance  │
│  (Backend API) │  │  (Backend API) │
│  Auto Scaling  │  │  Auto Scaling  │
└──────┬─────────┘  └──────┬─────────┘
       │                   │
       └────────┬──────────┘
                │
       ┌────────▼──────────┐
       │   RDS (MongoDB)   │
       │   Multi-AZ Setup  │
       │   Automated Backup│
       └───────────────────┘
```

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Docker and docker-compose installed locally
4. Git repository pushed to GitHub/CodeCommit

## Step 1: Set Up RDS (Database)

### Option A: MongoDB Atlas (Recommended)
1. Create MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
2. Create a project and cluster
3. Add IP whitelist for EC2 instances
4. Get connection string
5. Update `MONGO_URI` in environment variables

### Option B: RDS for DocumentDB (AWS-Managed MongoDB Compatible)
```bash
# Create RDS cluster via AWS Console:
# 1. Go to RDS Dashboard
# 2. Click "Create Database"
# 3. Select "Amazon DocumentDB"
# 4. Configure:
#    - DB Cluster Identifier: bitebuddy-prod
#    - Master Username: admin
#    - Master Password: [strong password]
#    - DB Subnet Group: default
#    - VPC: default
#    - Backup Retention: 7 days
#    - Encryption: Enable
# 5. Create and wait for cluster to be available
```

## Step 2: Create EC2 Instances

### Create Launch Template
```bash
# 1. Go to EC2 Dashboard > Launch Templates
# 2. Create new launch template:
#    - Name: bitebuddy-backend-template
#    - AMI: Ubuntu Server 22.04 LTS
#    - Instance Type: t3.medium (or t3.small for testing)
#    - Key Pair: Create or select existing
#    - Security Group: Create new
#    - Storage: 30GB EBS
```

### Configure Security Group
```bash
# Rules to allow:
# Inbound:
#   - HTTP (80) from ALB security group
#   - HTTPS (443) from ALB security group
#   - SSH (22) from your IP (for administration)
#   - 5000 from ALB security group (backend port)
# Outbound:
#   - All traffic (default)
```

### User Data Script
```bash
#!/bin/bash
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install Docker (optional)
apt-get install -y docker.io
usermod -aG docker ubuntu

# Clone repository
cd /home/ubuntu
git clone https://github.com/12Prasun/BiteBuddy_project.git
cd BiteBuddy_project

# Install dependencies
npm install

# Create environment file
cat > backend/.env << EOF
NODE_ENV=production
PORT=5000
MONGO_URI=${MONGO_URI}
JWT_SECRET=${JWT_SECRET}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
CORS_ORIGIN=https://${DOMAIN_NAME}
EOF

# Start application
npm start &

# Configure logging
mkdir -p /var/log/bitebuddy
chown ubuntu:ubuntu /var/log/bitebuddy
```

## Step 3: Set Up Auto Scaling

### Create Auto Scaling Group
```bash
# 1. Go to EC2 > Auto Scaling Groups
# 2. Create Auto Scaling Group:
#    - Name: bitebuddy-asg
#    - Launch Template: bitebuddy-backend-template
#    - VPC: default
#    - Subnets: Select 2+ across AZs
#    - Load Balancer: (create in next step)
#    - Min Size: 2
#    - Desired Capacity: 2
#    - Max Size: 4
#    - Health Check Type: ELB
#    - Health Check Grace Period: 300 seconds
```

## Step 4: Create Application Load Balancer

```bash
# 1. Go to EC2 > Load Balancers
# 2. Create Application Load Balancer:
#    - Name: bitebuddy-alb
#    - Scheme: internet-facing
#    - IP Address Type: ipv4
#    - VPC: default
#    - Subnets: Select 2+ across AZs
#
# 3. Create Target Group:
#    - Name: bitebuddy-backend
#    - Protocol: HTTP
#    - Port: 5000
#    - VPC: default
#    - Health Check:
#      - Path: /api/health
#      - Healthy Threshold: 2
#      - Unhealthy Threshold: 3
#      - Timeout: 5 seconds
#      - Interval: 30 seconds
#
# 4. Register targets from Auto Scaling Group
#
# 5. Create Listener:
#    - Protocol: HTTPS (after SSL certificate)
#    - Port: 443
#    - Default Action: Forward to target group
#    - SSL Certificate: (from ACM)
```

## Step 5: Set Up Frontend (S3 + CloudFront)

### Create S3 Bucket
```bash
# 1. Go to S3 > Create Bucket:
#    - Name: bitebuddy-frontend-prod
#    - Region: Your preferred region
#    - ACL: Private
#    - Block Public Access: Enable all
#    - Versioning: Enable
#    - Enable default encryption
#
# 2. Create build folder and upload static files:
npm run build --prefix frontend
aws s3 sync frontend/build s3://bitebuddy-frontend-prod --delete
```

### Create CloudFront Distribution
```bash
# 1. Go to CloudFront > Create Distribution:
#    - Origin Domain: S3 bucket
#    - S3 Access: OAI (Origin Access Identity)
#    - Viewer Protocol Policy: Redirect HTTP to HTTPS
#    - Cache Policy: Managed-CachingOptimized
#    - Compress Objects: Yes
#    - Default Root Object: index.html
#    - Custom Error: 404 > /index.html (for SPA routing)
#    - Enable WAF: Yes (optional)
#    - SSL Certificate: ACM certificate
#
# 2. Wait for distribution deployment (5-10 minutes)
# 3. Note CloudFront domain name
```

## Step 6: SSL/TLS Certificates (ACM)

```bash
# 1. Go to ACM > Request Certificate:
#    - Domain: yourdomain.com
#    - Validation Method: DNS
#    - Add domain: www.yourdomain.com
#
# 2. Complete DNS validation
# 3. Use certificate ARN in ALB and CloudFront
```

## Step 7: Environment Variables & Secrets

### Using AWS Systems Manager Parameter Store
```bash
# Store sensitive data:
aws ssm put-parameter \
  --name /bitebuddy/prod/mongo-uri \
  --value "mongodb+srv://..." \
  --type "SecureString"

# Retrieve in application:
const paramStore = new AWS.SSM();
const param = await paramStore.getParameter({
  Name: '/bitebuddy/prod/mongo-uri'
}).promise();
```

### Using AWS Secrets Manager
```bash
# Create secret:
aws secretsmanager create-secret \
  --name bitebuddy/prod/secrets \
  --secret-string '{
    "STRIPE_SECRET_KEY": "sk_...",
    "JWT_SECRET": "..."
  }'

# Update EC2 User Data to fetch secrets
```

## Step 8: CI/CD with AWS CodePipeline

### Create CodePipeline
```bash
# 1. Go to CodePipeline > Create Pipeline:
#    - Pipeline Name: bitebuddy-pipeline
#    - Source Provider: GitHub
#    - Repository: BiteBuddy_project
#    - Branch: master
#    - Change Detection: GitHub webhooks
#
# 2. Build Stage:
#    - Build Provider: CodeBuild
#    - Project Name: (create new)
#
# 3. Deploy Stage:
#    - Deploy Provider: CodeDeploy
#    - Application: bitebuddy
#    - Deployment Group: bitebuddy-asg
```

### Create CodeBuild Project
```bash
# buildspec.yml:
version: 0.2

phases:
  pre_build:
    commands:
      - npm install
      - npm run test:backend
  
  build:
    commands:
      - npm run build --prefix frontend
      - docker build -f backend/Dockerfile -t bitebuddy-backend:$CODEBUILD_BUILD_NUMBER .
  
  post_build:
    commands:
      - echo "Build completed"

artifacts:
  files:
    - '**/*'
  name: BuildArtifact
```

## Step 9: Monitoring & Alerts

### CloudWatch Configuration
```bash
# Create Log Groups:
aws logs create-log-group --log-group-name /bitebuddy/backend
aws logs create-log-group --log-group-name /bitebuddy/frontend

# Create Alarms:
aws cloudwatch put-metric-alarm \
  --alarm-name bitebuddy-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### SNS Notifications
```bash
# Create SNS topic:
aws sns create-topic --name bitebuddy-alerts

# Subscribe email:
aws sns subscribe \
  --topic-arn arn:aws:sns:region:account:bitebuddy-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com
```

## Step 10: Backup & Disaster Recovery

### RDS Backup
- Automated Daily Backups: 7 days retention
- Manual Snapshots: Weekly
- Cross-Region Replication: Enable

### S3 Backup
- Versioning: Enabled
- Cross-Region Replication: Enable
- Lifecycle Policy: Archive old versions after 30 days

## Step 11: Domain Setup (Route 53)

```bash
# 1. Create hosted zone for yourdomain.com
# 2. Create records:
#    - A Record: yourdomain.com -> ALB DNS
#    - A Record: www.yourdomain.com -> CloudFront
#    - CNAME: api.yourdomain.com -> ALB DNS
# 3. Update domain registrar nameservers
```

## Deployment Checklist

- [ ] RDS/MongoDB Atlas configured
- [ ] EC2 instances created and tested
- [ ] Auto Scaling Group configured
- [ ] Application Load Balancer created
- [ ] S3 bucket created with frontend build
- [ ] CloudFront distribution deployed
- [ ] SSL/TLS certificates installed
- [ ] Environment variables set
- [ ] CodePipeline configured
- [ ] CloudWatch monitoring enabled
- [ ] SNS notifications configured
- [ ] Backup strategy implemented
- [ ] Domain DNS configured
- [ ] Load test completed
- [ ] Security audit passed

## Cost Optimization

1. **EC2 Reserved Instances**: Save 30-50% on compute
2. **S3 Intelligent-Tiering**: Automatic cost optimization
3. **CloudFront Caching**: Reduce origin load
4. **RDS Reserved Instances**: Multi-year discounts
5. **AWS Compute Optimizer**: Right-sizing recommendations

## Troubleshooting

### Health Check Failures
```bash
# SSH into instance and check:
curl http://localhost:5000/api/health
npm logs  # check application logs
```

### High Latency
- Check CloudFront cache hit ratio
- Review RDS Performance Insights
- Analyze ALB target metrics

### Database Connection Issues
- Verify security group rules
- Check RDS/MongoDB credentials
- Test connectivity: `mongo mongodb+srv://...`

## Rollback Procedure

1. In CodePipeline, select previous successful build
2. Click "Release Change"
3. Monitor CloudWatch metrics
4. Verify application functionality
5. Document incident and root cause

## Maintenance Windows

- Database Patches: Sunday 2-4 AM UTC
- OS Patches: Sunday 3-5 AM UTC
- Application Deployments: Weekday off-hours
- Backup Verification: Daily 6 PM UTC

## Support & References

- AWS Documentation: https://docs.aws.amazon.com
- Elastic Beanstalk: Simpler alternative to manual setup
- AWS CodeStar: Project templates and scaffolding
- AWS Well-Architected Framework: Best practices
