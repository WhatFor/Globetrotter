variable "node_location" {
  type        = string
  description = "Geographical Location of the Node"
}

variable "azure_region" {
  type        = string
  description = "Azure Region"
}

variable "signalR_connectionString" {
  type        = string
  description = "The absolute URL of the host"
}

variable "next_node_address" {
  type        = string
  description = "The absolute URL of the next node"
}

variable "max_hop_count" {
  type        = number
  description = "The maximum number of hops to perform"
}

variable "delay_ms" {
  type        = number
  description = "The amount of time, if any, to wait for the next hop"
}
