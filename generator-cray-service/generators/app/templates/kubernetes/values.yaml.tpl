# Please see stable/cray-service/values.yaml (https://stash.us.cray.com/projects/CLOUD/repos/cray-charts/browse)
# for more info on values you can set/override

cray-service:
  type: "<%= kubernetesType %>"
  nameOverride: "<%= serviceName %>"
  replicaCount: 1

  containers:
    - name: "<%= serviceName %>"
      image:
        repository: "cray/<%= serviceName %>"
      env: []
      ports:
        - name: http
          port: <%= servicePort %>
      livenessProbe:
        port: <%= servicePort %>
        path: "<%= hasWebFrontend ? '/' : serviceBasePath + '/versions' %>"
      readinessProbe:
        port: <%= servicePort %>
        path: "<%= hasWebFrontend ? '/' : serviceBasePath + '/versions' %>"
      volumeMounts: [] # a standard container spec volumeMount list

  volumes: [] # a standard container spec volume list

  <% if (requiresExternalAccess) { %>
  ingress:
    enabled: true
  <% } %>
  <% if (requiresEtcdCluster) { %>
  etcdCluster:
    enabled: true
  <% } %>
  <% if (requiresSqlCluster) { %>
  sqlCluster:
    enabled: true
  <% } %>
