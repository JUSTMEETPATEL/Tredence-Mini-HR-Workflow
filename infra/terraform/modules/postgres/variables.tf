variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "environment" {
  type = string
}

variable "project_name" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "vnet_id" {
  type = string
}

variable "tags" {
  type = map(string)
}

variable "admin_username" {
  type    = string
  default = "hrflowAdmin"
}

variable "admin_password" {
  type      = string
  sensitive = true
}
