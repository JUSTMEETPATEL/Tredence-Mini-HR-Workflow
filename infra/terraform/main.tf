# ──────────────────────────────────────────────────────────
# HR Workflow Designer — Terraform Root Module
# Provisions AKS, ACR, Networking, Key Vault, Front Door
# ──────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.5"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
  }

  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "hrworkflowtfstate"
    container_name       = "tfstate"
    key                  = "hr-workflow.tfstate"
  }
}

provider "azurerm" {
  features {}
}

# ── Resource Group ─────────────────────────────────────
resource "azurerm_resource_group" "main" {
  name     = "${var.project_name}-${var.environment}-rg"
  location = var.location

  tags = var.common_tags
}

# ── Modules ────────────────────────────────────────────
module "networking" {
  source              = "./modules/networking"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  project_name        = var.project_name
  tags                = var.common_tags
}

module "acr" {
  source              = "./modules/acr"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  project_name        = var.project_name
  tags                = var.common_tags
}

module "keyvault" {
  source              = "./modules/keyvault"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  project_name        = var.project_name
  tags                = var.common_tags
}

module "aks" {
  source              = "./modules/aks"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  project_name        = var.project_name
  subnet_id           = module.networking.aks_subnet_id
  acr_id              = module.acr.acr_id
  keyvault_id         = module.keyvault.keyvault_id
  tags                = var.common_tags
}

module "frontdoor" {
  source              = "./modules/frontdoor"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = var.environment
  project_name        = var.project_name
  aks_fqdn            = module.aks.fqdn
  tags                = var.common_tags
}
