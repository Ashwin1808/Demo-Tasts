# Security and supply-chain controls

GitHub Actions configures Gitleaks, Trivy filesystem scanning, Trivy image scanning, and CycloneDX SBOM generation.

Filesystem Trivy is configured for HIGH/CRITICAL findings with `exit-code: 1` and `ignore-unfixed: true`. Image Trivy steps use `exit-code: 0`, so they report but do not block on findings.

GitHub Actions uses `GITOPS_TOKEN` for GitOps write access. Jenkins expects credential IDs `ghcr-creds` and `gitops-creds`. Kubernetes references `ghcr-secret`.

The inspected Helm values contained a placeholder database password (`change-me`). Replace it with secure secret injection before any real deployment. Never commit `.env`, token values, Kubernetes Secret data, Terraform state, or secret-bearing variable files.
