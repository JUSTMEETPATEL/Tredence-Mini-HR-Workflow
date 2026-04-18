# Development environment
project_name  = "hrworkflow"
environment   = "dev"
location      = "centralindia"
aks_node_count = 2
aks_vm_size    = "Standard_B2s"

common_tags = {
  Project     = "hr-workflow-designer"
  Environment = "dev"
  ManagedBy   = "terraform"
}
