# Please https://stash.us.cray.com/projects/CLOUD/repos/cray-charts/browse/stable/cray-service/values.yaml?at=refs%2Fheads%2Fmaster
# for more info on values you can set/override

cray-service:
  type: <%= kubernetesType %>
  nameOverride: <%= chartName %>
  containers:
    - name: <%= serviceName %>
      image:
        repository: cray/<%= serviceName %>
      ports:
        - name: http
          port: <%= servicePort %>
      livenessProbe:
        enabled: true
        port: <%= servicePort %>
        path: <%= serviceBasePath + '/versions' %>
      readinessProbe:
        enabled: true
        port: <%= servicePort %>
        path: <%= serviceBasePath + '/versions' %>
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
