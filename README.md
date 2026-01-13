# coding-platform (docker)

Quick commands to build and run the frontend compiler and server using Docker Compose.

Build the compiler image and run the frontend build (produces `./build`):

```powershell
cd coding-platform
docker compose build --no-cache compiler
docker compose run --rm compiler
```

Start the server (it will serve `./build` if present):

```powershell
docker compose up --detach server
docker compose logs -f server
```

Notes
- On Windows the compiler runs as root inside the container to avoid filesystem permission issues when writing `node_modules` and `build` to the host.
- If you prefer an image-only build (no host mounts) I can switch the compiler to build inside the image and copy artifacts into the server image.
- You can set `BUILD_DIR` env var for the server to point to the build location inside the container.
