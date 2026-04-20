#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ACR_NAME="${ACR_NAME:-hrworkflowdevacr}"
ACR_LOGIN_SERVER="${ACR_LOGIN_SERVER:-${ACR_NAME}.azurecr.io}"
RESOURCE_GROUP="${RESOURCE_GROUP:-hrworkflow-dev-rg}"
AKS_CLUSTER_NAME="${AKS_CLUSTER_NAME:-hrworkflow-dev-aks}"
KUBE_NAMESPACE="${KUBE_NAMESPACE:-app}"
DEPLOYMENT_NAME="${DEPLOYMENT_NAME:-web}"
IMAGE_NAME="${IMAGE_NAME:-web}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
BUILD_PLATFORM="${BUILD_PLATFORM:-linux/amd64}"

echo "==> Checking required CLIs"
command -v az >/dev/null
command -v docker >/dev/null
command -v kubectl >/dev/null

echo "==> Verifying Azure login"
az account show >/dev/null

echo "==> Verifying Docker daemon"
docker info >/dev/null

echo "==> Logging into ACR: ${ACR_NAME}"
az acr login --name "${ACR_NAME}"

echo "==> Building and pushing ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${IMAGE_TAG}"
docker buildx build \
  --platform "${BUILD_PLATFORM}" \
  -t "${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${IMAGE_TAG}" \
  --push \
  "${ROOT_DIR}/apps/web"

echo "==> Refreshing AKS credentials"
az aks get-credentials \
  --resource-group "${RESOURCE_GROUP}" \
  --name "${AKS_CLUSTER_NAME}" \
  --overwrite-existing >/dev/null

if [ -d "${ROOT_DIR}/infra/k8s/cert-manager" ]; then
  echo "==> Applying cert-manager manifests from repo"
  kubectl apply -f "${ROOT_DIR}/infra/k8s/cert-manager/"
fi

echo "==> Applying ingress manifests from repo"
kubectl apply -f "${ROOT_DIR}/infra/k8s/ingress/"

echo "==> Restarting deployment ${DEPLOYMENT_NAME} in namespace ${KUBE_NAMESPACE}"
kubectl rollout restart "deployment/${DEPLOYMENT_NAME}" -n "${KUBE_NAMESPACE}"

echo "==> Waiting for rollout"
kubectl rollout status "deployment/${DEPLOYMENT_NAME}" -n "${KUBE_NAMESPACE}" --timeout=180s

echo "==> Running pods"
kubectl get pods -n "${KUBE_NAMESPACE}" -l "app=${DEPLOYMENT_NAME}" -o wide

echo "==> Ingress"
kubectl get ingress -n "${KUBE_NAMESPACE}" -o wide

