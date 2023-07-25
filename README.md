# SFCC PennyBlack Integration

This plugin integrates SFCC to Penny Black providing the data for personalised prints.

## Installation

The installation steps differ slightly between SFRA and SiteGenesis, please follow the common steps and then the steps for your particuarlar setup.

### Common Steps

These steps apply to both SFRA and SiteGensis

- **Download latest version**  
  Download and extract the latest release from the [releases page](https://github.com/pennyblack-io/sfcc-pennyblack/releases)

- **Import metadata**  
  Within the `metadata/` directory you will find two files to be imported, one adds custom site preferences allowing you to enable/disable the integration and set the api key on a per site basis. The other adds a custom object which is used as a queue of the specific orders to be sent to Penny Black.

- **Upload the `int_pennyblack` cartridge**  
  This cartridge provides the base functionality needed to send order data onward to Penny Black and is needed for both SFRA and SiteGenesis installations.

- **Add the cartridge to sites cartridge path**  
  Navigate to `Administration > Sites > Manage Sites > [Your Site]`. In the Cartridges field, prepend `int_pennyblack` to the existing cartridge path, separated by a colon.

- **Update custom preferences per site**  
  Navigate to `Merchant Tools > Site Preferences > Custom Preferences > PennyBlack`. From here you can set the API Key and Enable or Disable the integration for each site.

### SFRA

- **Upload the `int_pennyblack_sfra` cartridge**  
  This cartridge extends the order confirmation, adding the newly placed order into the webhook queue pending processing.

- **Add the cartridge to sites cartridge path**  
  Navigate to `Administration > Sites > Manage Sites > [Your Site]`. In the Cartridges field, prepend `int_pennyblack_sfra` to the existing cartridge path, separated by a colon.

### SiteGenesis

The following is an example code snippet, the intent is to place the newly created order on to the queue for later processing.

This example is based on [v105.2.1](https://github.com/SalesforceCommerceCloud/sitegenesis/tree/v105.2.1) of SiteGenesis and modifying the controller at `COSummary.js::showConfirmation()` within `app_storefront_controllers/cartridge/controllers`.

Depending on your specific version and customisations the exact placement and the way in which the order is retrived might change but the following should remain.

```
var OrderWebhookQueue = require('*/cartridge/scripts/pennyblack/OrderWebhookQueue');
new OrderWebhookQueue().push(order);
```
