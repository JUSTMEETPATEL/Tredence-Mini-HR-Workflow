output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "aks_cluster_name" {
  description = "AKS cluster name"
  value       = module.aks.cluster_name
}

output "aks_kube_config" {
  description = "Kubeconfig for AKS (sensitive)"
  value       = module.aks.kube_config
  sensitive   = true
}

output "acr_login_server" {
  description = "ACR login server URL"
  value       = module.acr.login_server
}

output "frontdoor_endpoint" {
  description = "Azure Front Door endpoint hostname"
  value       = module.frontdoor.endpoint_hostname
}

output "keyvault_uri" {
  description = "Key Vault URI"
  value       = module.keyvault.vault_uri
}
