# Azure Deployment Guide for BiteBuddy

## Overview
Step-by-step guide for deploying BiteBuddy on Microsoft Azure using App Service, Cosmos DB, and Container Registry.

## Architecture Overview

```
┌────────────────────────────────────────────┐
│   Azure Front Door / CDN                   │
│   (Global acceleration & caching)          │
└──────────────┬─────────────────────────────┘
               │
┌──────────────▼─────────────────────────────┐
│   Application Gateway                      │
│   (Load balancing & WAF)                   │
└──────────────┬─────────────────────────────┘
               │
       ┌───────┴──────────┐
       │                  │
┌──────▼─────────┐  ┌──────▼─────────┐
│  App Service   │  │  App Service   │
│  Backend (API) │  │  Backend (API) │
│  Container     │  │  Container     │
└──────┬─────────┘  └──────┬─────────┘
       │                   │
       └────────┬──────────┘
                │
       ┌────────▼──────────┐
       │  Cosmos DB        │
       │  (MongoDB API)    │
       │  Global replication
       │  Auto-failover    │
       └───────────────────┘
```

## Prerequisites

1. Azure Account with subscription
2. Azure CLI installed: `az login`
3. Docker installed
4. Git repository on GitHub/Azure Repos

## Step 1: Create Resource Group

```bash
# Set variables
RESOURCE_GROUP="bitebuddy-prod"
LOCATION="eastus"  # Change to your preferred region

# Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

echo "Resource Group Created: $RESOURCE_GROUP"
```

## Step 2: Create Container Registry

```bash
# Variables
REGISTRY_NAME="bitebuddyregistry"  # Must be globally unique
SKU="Standard"  # Basic, Standard, Premium

# Create container registry
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $REGISTRY_NAME \
  --sku $SKU \
  --admin-enabled true

# Get registry credentials
az acr credential show \
  --resource-group $RESOURCE_GROUP \
  --name $REGISTRY_NAME

# Build and push images
az acr build \
  --registry $REGISTRY_NAME \
  --image bitebuddy-backend:latest \
  --file backend/Dockerfile .

az acr build \
  --registry $REGISTRY_NAME \
  --image bitebuddy-frontend:latest \
  --file frontend/Dockerfile \
  ./frontend
```

## Step 3: Create Cosmos DB (MongoDB API)

```bash
# Variables
DB_ACCOUNT_NAME="bitebuddy-db"
DATABASE_NAME="bitebuddy"

# Create Cosmos DB account with MongoDB API
az cosmosdb create \
  --name $DB_ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP \
  --kind MongoDB \
  --locations regionName=$LOCATION failoverPriority=0 \
  --enable-automatic-failover true \
  --capabilities EnableAggregationPipeline \
  --default-consistency-level Eventual

# Create database
az cosmosdb mongodb database create \
  --account-name $DB_ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP \
  --name $DATABASE_NAME

# Create collections
az cosmosdb mongodb collection create \
  --account-name $DB_ACCOUNT_NAME \
  --database-name $DATABASE_NAME \
  --resource-group $RESOURCE_GROUP \
  --name users \
  --shard "email"

az cosmosdb mongodb collection create \
  --account-name $DB_ACCOUNT_NAME \
  --database-name $DATABASE_NAME \
  --resource-group $RESOURCE_GROUP \
  --name orders \
  --shard "userId"

# Get connection string
az cosmosdb keys list \
  --name $DB_ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP \
  --type connection-strings
```

## Step 4: Create App Service Plan

```bash
# Variables
APP_SERVICE_PLAN="bitebuddy-plan"
SKU="P1V2"  # Options: B1, B2, B3, P1V2, P2V2, P3V2

# Create App Service Plan
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --is-linux \
  --sku $SKU

# Enable autoscaling
az monitor autoscale create \
  --resource-group $RESOURCE_GROUP \
  --resource-name-prefix "bitebuddy-backend" \
  --resource-type "Microsoft.Web/serverfarms" \
  --min-count 2 \
  --max-count 4 \
  --count 2
```

## Step 5: Create Web Apps

### Backend API
```bash
BACKEND_APP_NAME="bitebuddy-api"

# Create web app
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $BACKEND_APP_NAME \
  --deployment-container-image-name-user $REGISTRY_NAME \
  --deployment-container-image-name "bitebuddy-backend:latest"

# Configure container settings
az webapp config container set \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --docker-custom-image-name "$REGISTRY_NAME.azurecr.io/bitebuddy-backend:latest" \
  --docker-registry-server-url "https://$REGISTRY_NAME.azurecr.io" \
  --docker-registry-server-user $REGISTRY_USERNAME \
  --docker-registry-server-password $REGISTRY_PASSWORD

# Set environment variables
az webapp config appsettings set \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    NODE_ENV=production \
    PORT=5000 \
    MONGO_URI=$COSMOS_CONNECTION_STRING \
    JWT_SECRET=$JWT_SECRET \
    STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY \
    STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET \
    CORS_ORIGIN=https://$FRONTEND_URL

# Enable continuous deployment
az webapp deployment container config \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --enable-cd true

# Get webhook for webhook URL
az webapp deployment container show-cd-url \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP
```

### Frontend App
```bash
FRONTEND_APP_NAME="bitebuddy-web"

# Create web app for frontend
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $FRONTEND_APP_NAME \
  --deployment-container-image-name-user $REGISTRY_NAME \
  --deployment-container-image-name "bitebuddy-frontend:latest"

# Configure container settings
az webapp config container set \
  --name $FRONTEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --docker-custom-image-name "$REGISTRY_NAME.azurecr.io/bitebuddy-frontend:latest" \
  --docker-registry-server-url "https://$REGISTRY_NAME.azurecr.io" \
  --docker-registry-server-user $REGISTRY_USERNAME \
  --docker-registry-server-password $REGISTRY_PASSWORD

# Set environment variables
az webapp config appsettings set \
  --name $FRONTEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings REACT_APP_API_URL=https://$BACKEND_APP_NAME.azurewebsites.net \
    REACT_APP_STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC_KEY
```

## Step 6: Set Up Application Gateway

```bash
GATEWAY_NAME="bitebuddy-gateway"
PUBLIC_IP_NAME="bitebuddy-pip"

# Create public IP
az network public-ip create \
  --resource-group $RESOURCE_GROUP \
  --name $PUBLIC_IP_NAME \
  --sku Standard

# Create application gateway
az network application-gateway create \
  --name $GATEWAY_NAME \
  --resource-group $RESOURCE_GROUP \
  --capacity 2 \
  --sku Standard_v2 \
  --http-settings-cookie-based-affinity Disabled \
  --frontend-port 80 \
  --http-settings-port 8080 \
  --http-settings-protocol Http \
  --public-ip-address $PUBLIC_IP_NAME

# Add backend pool for API
az network application-gateway address-pool create \
  --gateway-name $GATEWAY_NAME \
  --resource-group $RESOURCE_GROUP \
  --name bitebuddy-api-pool \
  --servers "$BACKEND_APP_NAME.azurewebsites.net"

# Add HTTP settings for API
az network application-gateway http-settings create \
  --gateway-name $GATEWAY_NAME \
  --resource-group $RESOURCE_GROUP \
  --name bitebuddy-api-settings \
  --port 443 \
  --protocol Https \
  --cookie-based-affinity Disabled \
  --pick-host-name-from-backend-address true
```

## Step 7: Azure Front Door Setup

```bash
FRONT_DOOR_NAME="bitebuddy-frontdoor"

# Create Front Door
az afd profile create \
  --resource-group $RESOURCE_GROUP \
  --profile-name $FRONT_DOOR_NAME \
  --sku Premium_AzureFrontDoor

# Add backend pool
az afd origin-group create \
  --resource-group $RESOURCE_GROUP \
  --profile-name $FRONT_DOOR_NAME \
  --origin-group-name bitebuddy-backends \
  --probe-request-type GET \
  --probe-protocol Https \
  --probe-interval 100

# Add origins
az afd origin create \
  --resource-group $RESOURCE_GROUP \
  --profile-name $FRONT_DOOR_NAME \
  --origin-group-name bitebuddy-backends \
  --origin-name backend-api \
  --origin-host-header $BACKEND_APP_NAME.azurewebsites.net \
  --priority 1 \
  --weight 1000 \
  --enabled-state Enabled

# Create route
az afd route create \
  --resource-group $RESOURCE_GROUP \
  --profile-name $FRONT_DOOR_NAME \
  --endpoint-name bitebuddy-endpoint \
  --route-name api-route \
  --origin-group bitebuddy-backends \
  --supported-protocols Https Http \
  --patterns-to-match /api/* \
  --enabled-state Enabled
```

## Step 8: Configure HTTPS/SSL

```bash
# Using Azure Key Vault for certificates
VAULT_NAME="bitebuddy-keyvault"

# Create Key Vault
az keyvault create \
  --name $VAULT_NAME \
  --resource-group $RESOURCE_GROUP \
  --enable-soft-delete true \
  --enable-purge-protection false

# Import certificate
az keyvault certificate import \
  --vault-name $VAULT_NAME \
  --name bitebuddy-cert \
  --file /path/to/certificate.pfx \
  --password $CERT_PASSWORD

# Add managed identity to App Service
az webapp identity assign \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_APP_NAME

# Grant App Service access to Key Vault
PRINCIPAL_ID=$(az webapp identity show \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_APP_NAME \
  --query principalId -o tsv)

az keyvault set-policy \
  --name $VAULT_NAME \
  --object-id $PRINCIPAL_ID \
  --secret-permissions get list \
  --certificate-permissions get list

# Update App Service to use certificate
az webapp config ssl import \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --key-vault-uri "https://$VAULT_NAME.vault.azure.net/" \
  --key-vault-secret-name bitebuddy-cert
```

## Step 9: Set Up Azure DevOps Pipeline

Create `azure-pipelines.yml`:

```yaml
trigger:
  - master
  - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  dockerRegistryServiceConnection: 'bitebuddy'
  imageRepository: 'bitebuddy'
  containerRegistry: 'bitebuddyregistry.azurecr.io'
  dockerfilePath: '$(Build.SourcesDirectory)/backend/Dockerfile'

stages:
- stage: Build
  displayName: Build and Push
  jobs:
  - job: Build
    displayName: Build Job
    steps:
    - task: Docker@2
      displayName: Build and push backend image
      inputs:
        command: buildAndPush
        repository: 'bitebuddy-backend'
        dockerfile: $(dockerfilePath)
        containerRegistry: $(dockerRegistryServiceConnection)
        tags: |
          $(Build.BuildId)
          latest

- stage: Deploy
  displayName: Deploy to Azure
  jobs:
  - deployment: Deploy
    displayName: Deploy Job
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebApp@1
            displayName: 'Deploy to Azure App Service'
            inputs:
              azureSubscription: 'Azure Subscription'
              appType: 'webAppContainer'
              appName: 'bitebuddy-api'
              imageName: '$(containerRegistry)/bitebuddy-backend:$(Build.BuildId)'
```

## Step 10: Monitoring & Alerts

```bash
# Create Application Insights
az monitor app-insights component create \
  --app bitebuddy-insights \
  --location $LOCATION \
  --resource-group $RESOURCE_GROUP

# Enable diagnostics logging
az webapp log config \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --application-logging true \
  --level information \
  --detailed-error-messages true \
  --failed-request-tracing true

# Create action group for alerts
az monitor action-group create \
  --name bitebuddy-alerts \
  --resource-group $RESOURCE_GROUP

# Add email notification
az monitor action-group update \
  --name bitebuddy-alerts \
  --resource-group $RESOURCE_GROUP \
  --add-action email admin-email@example.com --action-group-action-name SendEmail
```

## Step 11: Configure Custom Domain

```bash
# Add custom domain to App Service
az webapp config hostname add \
  --webapp-name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --hostname api.yourdomain.com

# Create DNS CNAME record pointing to azurewebsites.net
# Via your domain registrar

# Bind SSL certificate
az webapp config ssl bind \
  --certificate-thumbprint $CERT_THUMBPRINT \
  --ssl-type SNI \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP
```

## Deployment Checklist

- [ ] Resource Group created
- [ ] Container Registry created and images pushed
- [ ] Cosmos DB account created with MongoDB API
- [ ] App Service Plan created
- [ ] Backend Web App deployed
- [ ] Frontend Web App deployed
- [ ] Application Gateway configured
- [ ] Front Door setup complete
- [ ] SSL/TLS certificates installed
- [ ] Azure DevOps pipeline created
- [ ] Application Insights enabled
- [ ] Monitoring alerts configured
- [ ] Custom domain configured
- [ ] Backup strategy enabled
- [ ] Load testing completed

## Cost Optimization

1. **Reserved Instances**: Save 30% on App Service
2. **Cosmos DB On-Demand**: Flexible pricing
3. **Azure Front Door**: Global acceleration at scale
4. **VM Size Optimization**: Right-size for workload
5. **Autoscaling**: Scale down during off-hours

## Troubleshooting

### Container Won't Start
```bash
az webapp log tail --name $BACKEND_APP_NAME --resource-group $RESOURCE_GROUP
```

### Database Connection Issues
- Verify Cosmos DB connection string
- Check firewall rules
- Test with MongoDB compass: `mongo connection_string`

### High Latency
- Check Application Insights performance metrics
- Review Cosmos DB Request Units
- Analyze Front Door cache hit ratio

## Cleanup

```bash
# Delete entire resource group
az group delete --name $RESOURCE_GROUP --yes

# This will delete all resources created
```

## Support & References

- Azure Documentation: https://docs.microsoft.com/azure
- Azure Best Practices: https://docs.microsoft.com/azure/architecture
- Azure Free Account: https://azure.microsoft.com/free
- Azure Pricing Calculator: https://azure.microsoft.com/pricing/calculator
