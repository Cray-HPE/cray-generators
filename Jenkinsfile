pipeline {

  agent {
    node { label 'docker' }
  }

  stages {

    stage('Prep') {
      steps {
        sh 'docker-compose -f ./.craypc/docker-compose.yaml down -v || true'
        sh 'docker-compose -f ./.craypc/docker-compose.yaml up -d --build'
      }
    }

    stage('Lint and Test') {
      steps {
        // TODO: we'll want to publish coverage reports
        sh 'docker exec craypc-generators npm run test'
      }
    }

    stage('Build') {
      steps {
        // TODO: we'll want a destination for the built docs
        sh 'docker exec craypc-generators npm run build'
      }
    }

    stage('Cleanup') {
      steps {
        sh 'docker-compose -f ./.craypc/docker-compose.yaml down -v'
      }
    }

  }

}