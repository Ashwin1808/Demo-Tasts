# Kubernetes and Helm

The Helm chart configures backend (2 initial replicas), frontend (1 replica), PostgreSQL 16, Services, a 1 GiB PostgreSQL PVC, backend HPA, probes, resource requests/limits, and Gateway API resources.

Backend HPA: minimum 2, maximum 5 replicas, CPU utilization target 70%, scale-down stabilization 300 seconds.

Deployments use RollingUpdate with `maxSurge: 1` and `maxUnavailable: 0`. Backend probes call `/api/health`; frontend probes call `/`.

Gateway API routes `/api` to the backend Service on port 8080 and `/` to the frontend Service on port 8080. A compatible Gateway API controller and CRDs are required.

```bash
helm lint helm/task-manager
helm template task-manager helm/task-manager -n task-manager
kubectl get deployments,services,pods -n task-manager
kubectl get hpa,pvc -n task-manager
kubectl get gateway,httproute -n task-manager
```

Configuration does not establish live runtime health; verify cluster output.
