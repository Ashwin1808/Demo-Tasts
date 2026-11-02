# GitOps

The separate repository is `Ashwin1808/task-manager-gitops`.

The Argo CD Application manifest at `argocd/task-manager.yaml` points to branch `main`, path `helm/task-manager`, and destination namespace `task-manager`. Automated sync, pruning, self-healing, and namespace creation are enabled in the manifest.

Expected flow: CI publishes images and updates image tags in Git; Argo CD observes the change and reconciles the Helm-defined desired state with Kubernetes.

Verify live status before claiming deployment success:

```bash
kubectl get applications -n argocd
kubectl get all -n task-manager
```
