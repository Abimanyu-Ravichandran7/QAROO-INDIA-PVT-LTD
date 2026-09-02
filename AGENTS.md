# Project Instructions

- NEVER start or run the backend server (`node server.js`) on your own, including detached/background processes. If the backend needs to run or restart, tell the user and let them run it manually.
- If you start a temporary server for testing (e.g. on a different port), always stop it and free the port before finishing.
- Never leave background processes running on error; verify the port is released.