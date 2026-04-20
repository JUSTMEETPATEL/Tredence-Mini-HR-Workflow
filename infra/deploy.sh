#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────
# FlowForge Azure Enterprise Deployment Script
# Orchestrates Terraform and Kubernetes dynamically
# ──────────────────────────────────────────────────────────

set -e

echo "🚀 Bootstrapping FlowForge Azure Enterprise Deployment..."

# 1. Verify Authentication
if ! az account show > /dev/null 2>&1; then
    echo "❌ You must be logged into Azure via 'az login' first!"
    exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "✅ Authenticated to Azure Subscription: $SUBSCRIPTION_ID"

# 2. Bootstrap Terraform Remote State Backend
STATE_RG="tfstate-rg"
STATE_SA="hrworkflowtfstate$RANDOM" # Make globally unique or static if already existing
STATE_CONTAINER="tfstate"
LOCATION="centralindia"

echo "📦 Ensuring Terraform Remote State Infrastructure exists..."
az group create --name $STATE_RG --location $LOCATION -o none

# Only create SA if it doesn't exist (assuming the user might have matched it exactly)
if ! az storage account show --name hrworkflowtfstate --resource-group $STATE_RG > /dev/null 2>&1; then
    echo "   Creating Storage Account 'hrworkflowtfstate'..."
    az storage account create --name hrworkflowtfstate --resource-group $STATE_RG --location $LOCATION --sku Standard_LRS --encryption-services blob -o none || true
fi

az storage container create --name $STATE_CONTAINER --account-name hrworkflowtfstate --auth-mode login -o none || true
echo "✅ Remote State Backend Ready."

# 3. Request Database Admin Secret (Securely)
echo ""
echo "🔐 Enter the secure password to assign to the new Azure Managed PostgreSQL Database:"
read -s DB_ADMIN_PASSWORD
echo ""

# 4. Execute Terraform
echo "🏗️ Initializing Terraform..."
cd infra/terraform

terraform init

echo "⚙️ Applying Infrastructure (This process will take 10-15 minutes globally)..."
terraform apply -var="db_admin_password=$DB_ADMIN_PASSWORD"

# Expose output variables for kubernetes steps
AKS_CLUSTER_NAME=$(terraform output -raw aks_cluster_name 2>/dev/null || echo "hrworkflow-dev-aks")
RESOURCE_GROUP=$(terraform output -raw resource_group_name 2>/dev/null || echo "hrworkflow-dev-rg")

cd ../../

# 5. Connect `kubectl` to the new AKS Cluster
echo "🔌 Bonding local kubectl to the new AKS instance ($AKS_CLUSTER_NAME)..."
az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER_NAME --overwrite-existing

# 6. Apply Kubernetes Manifests
echo "🚢 Deploying Core Kubernetes Services..."

kubectl apply -f infra/k8s/namespaces/
kubectl apply -f infra/k8s/secrets/
kubectl apply -f infra/k8s/configmaps/
kubectl apply -f infra/k8s/deployments/
kubectl apply -f infra/k8s/services/
kubectl apply -f infra/k8s/ingress/

echo ""
echo "🎉 DEPLOYMENT COMPLETE! 🎉"
echo "Your pods are now spinning up inside AKS. Check their status via:"
echo "   kubectl get pods -n app"
