def uid = UUID.randomUUID().toString().split('-')[0]

pipeline {

  agent {
    node { label 'docker' }
  }

  stages {

    stage('Init') {
      steps {
        sh "./.craypc/jenkins-init.sh ${uid}"
        // No build agents with compose yet
        // sh 'docker-compose -f ./.craypc/docker-compose.yaml down -v || true'
        // sh 'docker-compose -f ./.craypc/docker-compose.yaml up -d --build'
      }
    }

    stage('Lint and Test') {
      steps {
        // TODO: we'll want to publish coverage reports
        sh "docker exec cpcgen-${uid} npm run test"
      }
    }

    stage('Build') {
      steps {
        // TODO: we'll want a destination for the built docs
        sh "docker exec cpcgen-${uid} npm run build"
      }
    }

    stage('Cleanup') {
      steps {
        sh "./.craypc/jenkins-teardown.sh ${uid}"
        // No build agents with compose yet
        // sh 'docker-compose -f ./.craypc/docker-compose.yaml down -v'
      }
    }

  }

}
