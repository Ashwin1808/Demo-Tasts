# Terraform

The GitOps repository's `terraform/` configuration uses the HashiCorp AWS provider with test credentials, skips several AWS validation/metadata checks, and overrides the S3 endpoint to `http://localhost:4566`. It declares an S3 bucket named `ashwin-task-manager-terraform-state-demo`.

This is a local AWS-compatible endpoint configuration, not proof of resources provisioned in AWS.

The S3 bucket resource does not configure Terraform remote state. A remote backend requires an explicit backend block and initialization. The `.gitignore` excludes `.terraform/`, `*.tfstate`, `*.tfstate.*`, crash logs, and variable files; keep state out of Git.
