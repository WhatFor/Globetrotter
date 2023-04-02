## Globe Host App

# Resource Group
resource "azurerm_resource_group" "globe-host-rg" {
  name     = "globe-host-rg"
  location = var.azure_region
}

resource "azurerm_signalr_service" "example" {
  name                = "globe-host-signalr"
  location            = azurerm_resource_group.globe-host-rg.location
  resource_group_name = azurerm_resource_group.globe-host-rg.name
  service_mode        = "Serverless"
  sku {
    name     = "Free_F1"
    capacity = 1
  }
  cors {
    allowed_origins = ["*"]
  }
}

output "signalR_connectionString" {
  value = azurerm_signalr_service.example.primary_connection_string
}
