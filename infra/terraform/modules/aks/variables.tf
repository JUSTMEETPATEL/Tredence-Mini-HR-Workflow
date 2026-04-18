variable "resource_group_name" { type = string }
variable "location"            { type = string }
variable "environment"         { type = string }
variable "project_name"        { type = string }
variable "subnet_id"           { type = string }
variable "acr_id"              { type = string }
variable "keyvault_id"         { type = string }
variable "tags"                { type = map(string) }
