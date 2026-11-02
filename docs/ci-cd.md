# CI/CD

## GitHub Actions

Workflow: `.github/workflows/ci.yml`.

Triggers: pushes and pull requests to `main` and `develop`, plus manual dispatch.

Stages/jobs include Java 21/Maven verification, Node.js 22 frontend build, Gitleaks, Trivy filesystem scan, Docker image builds, Trivy image scans, CycloneDX SBOM generation/upload, GHCR publishing, and GitOps image-tag update.

Filesystem Trivy uses `exit-code: 1` for HIGH/CRITICAL findings. Image Trivy steps use `exit-code: 0`, so findings do not currently block the workflow. GitOps update requires `GITOPS_TOKEN`.

## Jenkins

Pipeline: `Jenkinsfile`; custom image definition: `Dockerfile.jenkins`.

Stages include checkout, environment check, Maven tests, frontend build, Docker image builds, GHCR login, image push, image verification, and GitOps repository update. Jenkins credential IDs: `ghcr-creds` and `gitops-creds`.

Jenkins and GitHub Actions are alternative implementations. The inspected Jenkinsfile does not include Gitleaks, Trivy, or SBOM stages.
