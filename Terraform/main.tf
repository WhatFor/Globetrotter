# Configure the Azure provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0.2"
    }
  }

  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {}
}

# Create the Host
module "host" {
  source       = "./modules/host"
  azure_region = "uksouth"
}

# Create the South Africa Node
module "node-southafrica" {
  source                   = "./modules/node"
  node_location            = "southafrica"
  azure_region             = "southafricanorth"
  signalR_connectionString = module.host.signalR_connectionString
  max_hop_count            = 10
  delay_ms                 = 0
  # This node is the first to be deployed, and does not have a next node yet
  next_node_address = "https://gl-node-uk-func.azurewebsites.net/api/Globetrotter"
}

# Create the India Node
module "node-india" {
  source                   = "./modules/node"
  node_location            = "india"
  azure_region             = "centralindia"
  signalR_connectionString = module.host.signalR_connectionString
  max_hop_count            = 10
  delay_ms                 = 0
  next_node_address        = module.node-southafrica.node_function_url
}

# Create the South East Asia Node
module "node-south-asia" {
  source                   = "./modules/node"
  node_location            = "southasia"
  azure_region             = "southeastasia"
  signalR_connectionString = module.host.signalR_connectionString
  max_hop_count            = 10
  delay_ms                 = 0
  next_node_address        = module.node-india.node_function_url
}

# Create the East Asia Node
module "node-east-asia" {
  source                   = "./modules/node"
  node_location            = "asia"
  azure_region             = "eastasia"
  signalR_connectionString = module.host.signalR_connectionString
  max_hop_count            = 10
  delay_ms                 = 0
  next_node_address        = module.node-south-asia.node_function_url
}

# Create the Japan Node
module "node-japan" {
  source                   = "./modules/node"
  node_location            = "japan"
  azure_region             = "japaneast"
  signalR_connectionString = module.host.signalR_connectionString
  max_hop_count            = 10
  delay_ms                 = 0
  next_node_address        = module.node-east-asia.node_function_url
}

# Create the West US Node
module "node-west-us" {
  source                   = "./modules/node"
  node_location            = "westus"
  azure_region             = "westus"
  signalR_connectionString = module.host.signalR_connectionString
  max_hop_count            = 10
  delay_ms                 = 0
  next_node_address        = module.node-japan.node_function_url
}

# Create the South US Node
module "node-us" {
  source                   = "./modules/node"
  node_location            = "southus"
  azure_region             = "southcentralus"
  signalR_connectionString = module.host.signalR_connectionString
  max_hop_count            = 10
  delay_ms                 = 0
  next_node_address        = module.node-west-us.node_function_url
}

# Create the Canada East Node
module "node-canada" {
  source                   = "./modules/node"
  node_location            = "canada"
  azure_region             = "canadaeast"
  signalR_connectionString = module.host.signalR_connectionString
  max_hop_count            = 10
  delay_ms                 = 0
  next_node_address        = module.node-us.node_function_url
}

# Create the UK Node
module "node-uk" {
  source                   = "./modules/node"
  node_location            = "uk"
  azure_region             = "uksouth"
  signalR_connectionString = module.host.signalR_connectionString
  max_hop_count            = 10
  delay_ms                 = 0
  next_node_address        = module.node-canada.node_function_url
}
