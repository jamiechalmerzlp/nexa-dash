# NexaDash

NexaDash is a self-hosted server dashboard focused on clean visuals, live charts,
and a polished control surface for smaller servers, homelabs, and private
infrastructure.

This repository is the custom NexaDash build, including:

- A dedicated `/settings` page for browser-side personalization
- Theme color controls
- Dashboard naming and browser title overrides
- Widget show and hide controls
- A root `docker-compose.yml` with the required read-only host bind mount
- Portainer-friendly deployment via `docker-compose.portainer.yml`

## Highlights

- Live CPU, RAM, storage, network, and GPU graphs
- Glass-style dashboard layout
- Dark and light mode support
- Browser-stored personalization layer
- Docker and Portainer deployment support

## Repository

- GitHub: https://github.com/jamiechalmerzlp/nexa-dash
- Docker Hub: https://hub.docker.com/r/jamiechalmerzlp/nexadash
- Compose file: `docker-compose.yml`
- Compose file for Portainer: `docker-compose.portainer.yml`

## Deploy With Docker Compose

For a normal Docker Compose deployment, the repo root now includes a ready-to-run
`docker-compose.yml` that already mounts the host root into `/mnt/host` as
read-only, so OS, storage, and network detection work by default.

```bash
docker compose up -d
```

The dashboard will be available on port `3001`, and the settings page will be at
`/settings`.

## Deploy With Portainer

In Portainer, you can deploy using the published Docker Hub image with the
included compose file:

- Repository URL: `https://github.com/jamiechalmerzlp/nexa-dash.git`
- Reference: `main`
- Compose path: `docker-compose.portainer.yml`

After deployment, Portainer will pull `jamiechalmerzlp/nexadash:latest`. The
dashboard should be available on port `3001`, and the settings page will be at
`/settings`.

## Publish Docker Image

This repository includes a GitHub Actions workflow that can publish the Docker
image to Docker Hub.

The repository root now includes a `Dockerfile`, so Docker Hub autobuilds and
manual `docker build` runs can target the default path without extra config.

Add these repository secrets and variables in GitHub first:

- Repository variable: `DOCKERHUB_USERNAME`
- Repository secret: `DOCKERHUB_TOKEN`

Then run the `Docker Publish` workflow manually, or push to `main`.

For local image builds:

```bash
docker build -t jamiechalmerzlp/nexadash:latest .
```

## Local Branding Notes

The platform branding, internal package scope, and runtime environment variable
prefixes have been updated to NexaDash.

## License

This project is distributed under the MIT license. See [LICENSE.md](./LICENSE.md).
