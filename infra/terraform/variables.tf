variable "project_name" {
  description = "Project identifier used in resource naming"
  type        = string
  default     = "hrworkflow"
}

variable "environment" {
  description = "Deployment environment (dev | prod)"
  type        = string
  default     = "dev"
  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "Environment must be 'dev' or 'prod'."
  }
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "centralindia"
}

variable "common_tags" {
  description = "Tags applied to all resources"
  type        = map(string)
  default = {
    Project     = "hr-workflow-designer"
    ManagedBy   = "terraform"
  }
}

variable "aks_node_count" {
  description = "Default node count for AKS system pool"
  type        = number
  default     = 2
}

variable "aks_vm_size" {
  description = "VM size for AKS nodes"
  type        = string
  default     = "Standard_B2s"
}
