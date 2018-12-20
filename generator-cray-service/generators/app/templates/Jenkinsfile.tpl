@Library('dst-shared@master') _

dockerBuildPipeline {
    repository = "cray"
    imagePrefix = "cray"
    app = "<%= serviceName %>"
    name = "<%= serviceName %>"
    description = "Cray service <%= serviceName %>"
    useLazyDocker = true
}