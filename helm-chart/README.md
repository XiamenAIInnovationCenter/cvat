
[See for details](https://docs.cvat.ai/docs/administration/advanced/k8s_deployment_with_helm/)

## Authentication configuration

The backend can load the optional `auth_config.yml` from an existing Kubernetes
Secret. Create the Secret in the release namespace, then point the Helm value at
it:

```console
kubectl -n cvat create secret generic cvat-auth-config \
  --from-file=auth_config.yml=./auth_config.yml

helm upgrade --install cvat ./helm-chart \
  --set cvat.backend.server.authConfig.existingSecret=cvat-auth-config
```

The chart mounts the Secret at `/home/django/auth_config.yml` and sets
`AUTH_CONFIG_PATH` for the CVAT backend server. The Secret is not created by the
chart, so credentials remain outside Helm values and release history. To use a
different Secret key or mount path, override
`cvat.backend.server.authConfig.key` and
`cvat.backend.server.authConfig.mountPath`.
