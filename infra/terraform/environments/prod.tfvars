# Production environment
project_name  = "hrworkflow"
environment   = "prod"
location      = "centralindia"
aks_node_count = 3
aks_vm_size    = "Standard_D2s_v3"

common_tags = {
  Project     = "hr-workflow-designer"
  Environment = "prod"
  ManagedBy   = "terraform"
}
