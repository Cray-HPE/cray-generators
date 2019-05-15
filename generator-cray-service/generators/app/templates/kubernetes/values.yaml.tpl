# Please refer to https://stash.us.cray.com/projects/CLOUD/repos/cray-charts/browse/stable/cray-service/values.yaml?at=refs%2Fheads%2Fmaster
# for more info on values you can set/override
# Note that cray-service.containers[*].image and cray-service.initContainers[*].image map values are one of the only structures that
# differ from the standard kubernetes container spec:
# image:
#   repository: ""
#   tag: "" (default = "latest")
#   pullPolicy: "" (default = "IfNotPresent")

cray-service:
  type: <%= kubernetesType %>
  nameOverride: <%= chartName %>
  containers:
    - name: <%= serviceName %>
      image:
        repository: cray/<%= serviceName %>
      ports:
        - name: http
          containerPort: <%= servicePort %>
          protocol: TCP
      livenessProbe:
        httpGet:
          port: <%= servicePort %>
          path: <%= serviceBasePath + '/versions' %>
        initialDelaySeconds: 5
        periodSeconds: 3
      readinessProbe:
        httpGet:
          port: <%= servicePort %>
          path: <%= serviceBasePath + '/versions' %>
        initialDelaySeconds: 5
        periodSeconds: 3
  <% if (requiresExternalAccess || hasUi) { %>
  ingress:
    enabled: true
    <% if (hasUi) { %>
    ui: true
    <% } %>
  <% } %>
  <% if (requiresEtcdCluster) { %>
  etcdCluster:
    enabled: true
  <% } %>
  <% if (requiresSqlCluster) { %>
  sqlCluster:
    enabled: true
  <% } %>
