# Architecture

## Application

```mermaid
flowchart TD
  Browser --> Nginx
  Nginx -->|/api| SpringBoot
  SpringBoot --> PostgreSQL
```

## CI and GitOps

```mermaid
flowchart TD
  GitHub --> GitHubActions
  GitHub --> Jenkins
  GitHubActions --> GHCR
  Jenkins --> GHCR
  GitHubActions --> GitOps
  Jenkins --> GitOps
  GitOps --> Helm
  ArgoCD --> Helm
  Helm --> Kubernetes
```

GitHub Actions and Jenkins are alternative CI implementations. Argo CD is configured to watch the GitOps repository and reconcile the Helm application.
