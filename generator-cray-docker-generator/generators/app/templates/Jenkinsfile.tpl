@Library('dst-shared@master') _

dockerBuildPipeline {
        repository = "cray"
        imagePrefix = "cray"
        app = "<%= projectName %>"
        name = "<%= projectName %>"
        description = "Cray Storage System Manager, Software Manager"
        useLazyDocker = true

}