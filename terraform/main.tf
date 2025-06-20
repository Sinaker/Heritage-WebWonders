terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      version = "4.33.0"
    }
  }
}

provider "azurerm" {
  # Configuration options
  client_id       = var.clientId
  client_secret   = var.clientSecret
  tenant_id       = var.tenantId
  subscription_id = var.subscriptionId
  features {}
}
resource "azurerm_resource_group" "darshangrp" {
  name = "darshan"
  location = "Central India"
}
resource "azurerm_storage_account" "kkppublicstorage" {
    name = "kkppublicstorage"
    resource_group_name = azurerm_resource_group.darshangrp.name
    location                 = azurerm_resource_group.darshangrp.location
    account_tier             = "Standard"
    account_replication_type = "LRS"
}
resource "azurerm_storage_container" "darshanstore" {
  name                  = "darshanstore"
  storage_account_id    = azurerm_storage_account.kkppublicstorage.id
  container_access_type = "blob"
}

resource "azurerm_container_registry" "darshanRepo" {
  name                = "darshanRepo"
  resource_group_name = azurerm_resource_group.darshangrp.name
  location            = azurerm_resource_group.darshangrp.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_service_plan" "darshanPlan" {
  name                = "darshanPlan"
  resource_group_name = azurerm_resource_group.darshangrp.name
  location            = azurerm_resource_group.darshangrp.location
  os_type             = "Linux"
  sku_name            = "F1"
}
