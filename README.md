# n8n-nodes-selector

This is an n8n community node. It lets you use a **Selector** node in your n8n workflows to dynamically switch between multiple inputs based on conditions.

The **Selector Node** is useful for routing data in a workflow. It offers two modes:
- **Single Select**: Passes through data from one of two inputs based on a boolean condition.
- **Multi Select**: Dynamically routes data based on an index condition, selecting from multiple inputs.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

The **Selector Node** supports the following operations:

### **Single Select**
- Accepts two inputs.
- Evaluates a **boolean condition**.
- Passes through either **Input 1** or **Input 2** depending on the condition.

### **Multi Select**
- Accepts **a dynamic number of inputs**.
- Evaluates a **numeric index condition**.
- Passes through the input at the given index.
- Optionally, **waits for all inputs** before processing.

## Compatibility

This node is compatible with n8n v1.0 and later. It has been tested against the latest stable n8n versions.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [n8n official website](https://n8n.io/)

## Version history

- **v1.0.0** - Initial release with Single Select and Multi Select functionality.
