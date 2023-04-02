## Globe Node Function - .NET 6 - Linux

# Resource Group
resource "azurerm_resource_group" "globe-node-rg" {
  name     = "gl-node-${var.node_location}-rg"
  location = var.azure_region
}

# Storage Account
resource "azurerm_storage_account" "globe-node-sa" {
  name                     = "gl${var.node_location}sa"
  resource_group_name      = azurerm_resource_group.globe-node-rg.name
  location                 = var.azure_region
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# Storage Container
resource "azurerm_storage_container" "globe-node-storage-container" {
  name                 = "gl-node-${var.node_location}"
  storage_account_name = azurerm_storage_account.globe-node-sa.name
}

# App Service Plan
resource "azurerm_service_plan" "globe-node-plan" {
  name                = "gl-node-${var.node_location}-plan"
  resource_group_name = azurerm_resource_group.globe-node-rg.name
  location            = var.azure_region
  os_type             = "Linux"
  sku_name            = "Y1" # Dynamic
}

# Node Function Code
data "archive_file" "node_function_zip" {
  type        = "zip"
  source_dir  = "../Node/bin/Release/net6.0/publish/"
  output_path = "function-app.zip"
}

# Upload Code to Blob
resource "azurerm_storage_blob" "node_functionstorage_blob" {
  name                   = "${filesha256(data.archive_file.node_function_zip.output_path)}.zip"
  storage_account_name   = azurerm_storage_account.globe-node-sa.name
  storage_container_name = azurerm_storage_container.globe-node-storage-container.name
  type                   = "Block"
  source                 = data.archive_file.node_function_zip.output_path
}

# SAS
data "azurerm_storage_account_blob_container_sas" "storage_account_blob_container_sas" {
  connection_string = azurerm_storage_account.globe-node-sa.primary_connection_string
  container_name    = azurerm_storage_container.globe-node-storage-container.name
  start             = "2023-01-01T00:00:00Z"
  expiry            = "2024-01-01T00:00:00Z"

  permissions {
    read   = true
    add    = false
    create = false
    write  = false
    delete = false
    list   = false
  }
}

# AI
resource "azurerm_application_insights" "globe-node-ai" {
  name                 = "gl-node-${var.node_location}-ai"
  location             = var.azure_region
  resource_group_name  = azurerm_resource_group.globe-node-rg.name
  application_type     = "web"
  retention_in_days    = 30
  daily_data_cap_in_gb = 1
}

# Function
resource "azurerm_linux_function_app" "globe-node-func" {
  name                       = "gl-node-${var.node_location}-func"
  resource_group_name        = azurerm_resource_group.globe-node-rg.name
  location                   = var.azure_region
  service_plan_id            = azurerm_service_plan.globe-node-plan.id
  storage_account_name       = azurerm_storage_account.globe-node-sa.name
  storage_account_access_key = azurerm_storage_account.globe-node-sa.primary_access_key
  app_settings = {
    "AzureSignalRConnectionString"   = var.signalR_connectionString
    "NextNodeAddress"                = var.next_node_address
    "SelfIdentifier"                 = var.node_location
    "MaxHopCount"                    = var.max_hop_count
    "DelayMs"                        = var.delay_ms
    "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.globe-node-ai.instrumentation_key,
    "WEBSITE_RUN_FROM_PACKAGE"       = "https://${azurerm_storage_account.globe-node-sa.name}.blob.core.windows.net/${azurerm_storage_container.globe-node-storage-container.name}/${azurerm_storage_blob.node_functionstorage_blob.name}${data.azurerm_storage_account_blob_container_sas.storage_account_blob_container_sas.sas}",
  }
  site_config {
    always_on       = false
    http2_enabled   = true
    app_scale_limit = 1
    cors {
      support_credentials = true
      allowed_origins     = ["http://localhost:3000", "https://globetrotter-kappa.vercel.app"]
    }
    application_stack {
      dotnet_version = "6.0"
    }
  }
}

output "node_function_url" {
  value = "https://gl-node-${var.node_location}-func.azurewebsites.net/api/Globetrotter"
}
