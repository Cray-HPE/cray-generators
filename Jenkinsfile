pipeline {

  agent {
    node { label 'docker' }
  }

  stages {

    stage('Build/Lint/Test') {
      steps {
        // TODO: 1) wire up to standard craypc pipeline when we can
        sh "docker build -f ./.craypc/containers/Dockerfile.generators -t craypc/generators ."
      }
    }

  }

}
