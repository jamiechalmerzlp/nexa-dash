# Nexa Dash

Nexa Dash is a self-hosted server dashboard focused on clean visuals, live charts,
and a polished control surface for smaller servers, homelabs, and private
infrastructure.

This repository is the custom Nexa Dash build, including:

- A dedicated `/settings` page for browser-side personalization
- Theme color controls
- Dashboard naming and browser title overrides
- Widget show and hide controls
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
- Compose file for Portainer: `docker-compose.portainer.yml`

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

Add these repository secrets and variables in GitHub first:

- Repository variable: `DOCKERHUB_USERNAME`
- Repository secret: `DOCKERHUB_TOKEN`

Then run the `Docker Publish` workflow manually, or push to `main`.

## Local Branding Notes

The visible project branding in this repo has been updated to Nexa Dash. The
underlying code structure still contains some internal package names and
environment variable prefixes inherited from the original architecture so the
app keeps building and running correctly.

## License

This project is distributed under the MIT license. See [LICENSE.md](./LICENSE.md).
