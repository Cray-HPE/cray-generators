# Please see stable/cray-service/values.yaml (https://stash.us.cray.com/projects/CLOUD/repos/cray-charts/browse)
# for more info on values you can set/override

type: "<%= kubernetesType %>"
nameOverride: "<%= serviceName %>"
replicaCount: 1

image:
  name: "<%= serviceName %>"
  repository: "dtr.dev.cray.com/cray/<%= serviceName %>"
<% if (hasPersistentData) { %>
volumes:
  mounts: []
  # - name: upload
  #   path: /var/uploads
  #   persistence: true
  #   accessMode: ReadWriteOnce
  #   storageClass: -
  #   size: 512Mb
<% } %>
<% if (isApi || hasWebFrontend) { %>
ingress:
  enabled: true
<% } %>