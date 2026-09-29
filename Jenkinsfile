pipeline {
    agent any

    environment {
        REGISTRY = 'ghcr.io'
        IMAGE_OWNER = 'ashwin1808'

        BACKEND_IMAGE = "${REGISTRY}/${IMAGE_OWNER}/task-manager-backend"
        FRONTEND_IMAGE = "${REGISTRY}/${IMAGE_OWNER}/task-manager-frontend"

        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Environment Check') {
            steps {
                sh 'java -version'
                sh 'git --version'
                sh 'docker --version'
                sh 'node --version || true'
                sh 'npm --version || true'
            }
        }

        stage('Backend Tests') {
            steps {
                sh '''
                    cd backend
                    mvn test
                '''
            }
        }

        stage('Frontend Build') {
            steps {
                sh '''
                    cd frontend
                    npm ci
                    npm run build
                '''
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    docker build \
                      -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                      -t ${BACKEND_IMAGE}:jenkins \
                      ./backend

                    docker build \
                      -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                      -t ${FRONTEND_IMAGE}:jenkins \
                      ./frontend
                '''
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'ghcr-creds',
                        usernameVariable: 'GHCR_USERNAME',
                        passwordVariable: 'GHCR_TOKEN'
                    )
                ]) {
                    sh '''
                        echo "$GHCR_TOKEN" | docker login ${REGISTRY} \
                          -u "$GHCR_USERNAME" \
                          --password-stdin
                    '''
                }
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                    docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                    docker push ${BACKEND_IMAGE}:jenkins

                    docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                    docker push ${FRONTEND_IMAGE}:jenkins
                '''
            }
        }

        stage('Verify Images') {
            steps {
                sh '''
                    docker images | grep task-manager
                '''
            }
        }
    }

    stage('Update GitOps') {
      steps {
          withCredentials([
              usernamePassword(
                  credentialsId: 'gitops-creds',
                  usernameVariable: 'GIT_USERNAME',
                  passwordVariable: 'GIT_TOKEN'
              )
          ]) {
              sh '''
                  rm -rf gitops

                  git clone https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/Ashwin1808/task-manager-gitops.git gitops

                  cd gitops

                  sed -i "/repository: ghcr.io\\/ashwin1808\\/task-manager-backend/{n;s/tag:.*/tag: ${IMAGE_TAG}/;}" helm/task-manager/values.yaml

                  sed -i "/repository: ghcr.io\\/ashwin1808\\/task-manager-frontend/{n;s/tag:.*/tag: ${IMAGE_TAG}/;}" helm/task-manager/values.yaml

                  git config user.name "Jenkins"
                  git config user.email "jenkins@local"

                  git add helm/task-manager/values.yaml

                  git commit -m "ci: update images to ${IMAGE_TAG}" || echo "No changes to commit"

                  git push origin main
              '''
          }
      }
  }

    post {
        success {
            echo 'Jenkins CI + GHCR pipeline completed successfully.'
        }

        failure {
            echo 'Jenkins CI + GHCR pipeline failed.'
        }

        always {
            sh 'docker logout ${REGISTRY} || true'
            echo 'Jenkins pipeline execution finished.'
        }
    }
}