pipeline {

  agent {
    node { label 'docker' }
  }

  stages {

    stage('Lint and Test') {
      steps {
        // TODO: we'll want to publish coverage reports
        sh './test'
      }
    }

    stage('Build') {
      steps {
        // TODO: we'll want a destination for the built docs
        sh './build'
      }
    }

  }

}