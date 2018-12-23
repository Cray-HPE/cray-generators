# Please see stable/cray-service/values.yaml for more info on values you can set/override

type: "<%= kubernetesType %>"
nameOverride: "<%= serviceName %>"
replicaCount: 1

image:
  name: "<%= serviceName %>"
  repository: "dtr.dev.cray.com/cray/<%= serviceName %>"