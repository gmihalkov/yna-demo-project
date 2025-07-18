# Synchronous Web Socket

The demo project for YNA.

## Requirements

- Node.js v22+
- pnpm

## Installation

```bash
git clone https://github.com/gmihalkov/yna-demo-project.git --depth=1
pnpm i
```

## Usage

First, you need to start the WebSocket server:

```bash
pnpm start-server
```

Now, once the client application connects this server, it will send the message sequence described in the
[protocol-server.json](./protocol-server.json).

Next, you need to start the client:

```bash
pnpm start-client
```

This client will connect to the server and check if the received message sequence matches with the one described in
[protocol-client.json](./protocol-client.json).

When the whole message sequence will be received, or invalid, the client will close the WebSocket connection and exit.

If you want to test some other message sequences, you can modify [protocol-server.json](./protocol-server.json) or
[protocol-client.json](./protocol-client.json) and restart server or client correspondingly.

To restart the server or client, just stop it by `Ctrl+C` (or `Cmd+C` if you're on MacOS), and start it again.
