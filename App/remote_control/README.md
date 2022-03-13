
# Remote Control for Melophony

This document explains how to enable the remote control of Melophony application.
The current configuration is for the WeChip G20 remote controller.

## Prerequisites

The following libraries/binaries must be installed:

* xinput
* hid_mapper binary (https://github.com/Captain-ASCII/hid_mapper)

# Usage

In order to allow remote control, the start.sh script must be run. It will:

* Disable the events in the system in order to ignore some events
* Use hid_mapper to map button events to keys that can be catched by the navigator and Melophony.

# Development

The remote_command.map file allows to indicate which keys should be associated to the (hex) binary command used by the remote controler when pressing a button.
To get the actual command when pressing a specific button, use the following command:

* sudo ./hid_mapper --lookup-id --manufacturer '0c40' --product '7a1c' --learn # replace manufacturer/product IDs as required