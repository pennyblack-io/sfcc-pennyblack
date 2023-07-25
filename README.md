# SFCC PennyBlack Integration

This plugin integrates SFCC to Penny Black providing the data for personalised prints.

## Installation

The installation steps differ slightly between SFRA and SiteGenesis, please follow the common steps and then the steps for your particular setup.

### Common Steps

These steps apply to both SFRA and SiteGenesis

- **Download latest version**  
  Download and extract the latest release from the [releases page](https://github.com/pennyblack-io/sfcc-pennyblack/releases)

- **Import metadata**  
  Within the `metadata/` directory you will find the SitePreferences, CustomObjects and Jobs used by the integration to queue order data to then be sent onward to Penny Black.

- **Upload the `int_pennyblack` cartridge**  
  This cartridge provides the base functionality needed to send order data onward to Penny Black and is needed for both SFRA and SiteGenesis installations.

- **Add the cartridge to sites cartridge path**  
  Navigate to `Administration > Sites > Manage Sites > [Your Site]`. In the Cartridges field, prepend `int_pennyblack` to the existing cartridge path, separated by a colon.

- **Update custom preferences per site**  
  Navigate to `Merchant Tools > Site Preferences > Custom Preferences > PennyBlack`. From here you can set the API Key and Enable or Disable the integration for each site.

- **Schedule when order data is sent to Penny Black**  
  Navigate to `Administration > Operations > Jobs`
  - **New Job:** PennyBlack_OrderWebhook
  - **Job Steps:**
    - **Configure step:**
      - **ID:** OrderWebhookProcessor
      - **ExecuteScriptModule.Module:** int_pennyblack/cartridge/scripts/pennyblack/OrderWebhookJob.js
    - **Scope:** all sites
  - **Schedule and history:**
    - **Enabled:** checked
    - **Active > Trigger:** Recurring Interval
    - **Runtime > Every > Amount:** 5
    - **Runtime > Every > Interval:** Minutes

### SFRA

- **Upload the `int_pennyblack_sfra` cartridge**  
  This cartridge extends the order confirmation, adding the newly placed order into the webhook queue pending processing.

- **Add the cartridge to sites cartridge path**  
  Navigate to `Administration > Sites > Manage Sites > [Your Site]`. In the Cartridges field, prepend `int_pennyblack_sfra` to the existing cartridge path, separated by a colon.

### SiteGenesis

The following is an example code snippet, the intent is to place the newly created order on to the queue for later processing.

This example is based on [v105.2.1](https://github.com/SalesforceCommerceCloud/sitegenesis/tree/v105.2.1) of SiteGenesis and modifying the controller at `COSummary.js::showConfirmation()` within `app_storefront_controllers/cartridge/controllers`.

Depending on your specific version and customisations the exact placement and the way in which the order is retrieved might change but the following should remain.

```
var OrderWebhookQueue = require('*/cartridge/scripts/pennyblack/OrderWebhookQueue');
new OrderWebhookQueue().push(order);
```
