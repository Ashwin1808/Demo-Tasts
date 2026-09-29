pipeline {
    agent any

    environment {
        REGISTRY = 'ghcr.io'
        IMAGE_OWNER = 'ashwin1808'

        BACKEND_IMAGE  = "${REGISTRY}/${IMAGE_OWNER}/task-manager-backend"
        FRONTEND_IMAGE = "${REGISTRY}/${IMAGE_OWNER}/task-manager-frontend"

        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        // =========================================================
        // 1. CHECKOUT
        // =========================================================
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // =========================================================
        // 2. ENVIRONMENT CHECK
        // =========================================================
        stage('Environment Check') {
            steps {
                sh '''
                    echo "===== Environment Check ====="

                    java -version
                    git --version
                    docker --version
                    node --version || true
                    npm --version || true

                    echo "============================="
                '''
            }
        }

        // =========================================================
        // 3. BACKEND TESTS
        // =========================================================
        stage('Backend Tests') {
            steps {
                sh '''
                    cd backend

                    echo "Running backend tests..."

                    mvn test
                '''
            }
        }

        // =========================================================
        // 4. FRONTEND BUILD
        // =========================================================
        stage('Frontend Build') {
            steps {
                sh '''
                    cd frontend

                    echo "Installing frontend dependencies..."
                    npm ci

                    echo "Building frontend..."
                    npm run build
                '''
            }
        }

        // =========================================================
        // 5. DOCKER BUILD
        // =========================================================
        stage('Docker Build') {
            steps {
                sh '''
                    echo "Building backend Docker image..."

                    docker build \
                        -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                        -t ${BACKEND_IMAGE}:jenkins \
                        ./backend


                    echo "Building frontend Docker image..."

                    docker build \
                        -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        -t ${FRONTEND_IMAGE}:jenkins \
                        ./frontend


                    echo "Docker images built successfully."
                '''
            }
        }

        // =========================================================
        // 6. DOCKER LOGIN
        // =========================================================
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
                            --username "$GHCR_USERNAME" \
                            --password-stdin
                    '''
                }
            }
        }

        // =========================================================
        // 7. PUSH IMAGES TO GHCR
        // =========================================================
        stage('Push Images') {
            steps {
                sh '''
                    echo "Pushing backend image..."

                    docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                    docker push ${BACKEND_IMAGE}:jenkins


                    echo "Pushing frontend image..."

                    docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                    docker push ${FRONTEND_IMAGE}:jenkins


                    echo "Images pushed successfully."
                '''
            }
        }

        // =========================================================
        // 8. VERIFY IMAGES
        // =========================================================
        stage('Verify Images') {
            steps {
                sh '''
                    echo "===== Docker Images ====="

                    docker images | grep task-manager || true

                    echo "========================="
                '''
            }
        }

        // =========================================================
        // 9. UPDATE GITOPS REPOSITORY
        // =========================================================
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
                        set -e

                        echo "Cloning GitOps repository..."

                        rm -rf gitops

                        git clone \
                            https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/Ashwin1808/task-manager-gitops.git \
                            gitops


                        cd gitops

                        echo "Updating backend image tag..."

                        sed -i \
                            "/repository: ghcr.io\\/ashwin1808\\/task-manager-backend/{n;s/tag:.*/tag: ${IMAGE_TAG}/;}" \
                            helm/task-manager/values.yaml


                        echo "Updating frontend image tag..."

                        sed -i \
                            "/repository: ghcr.io\\/ashwin1808\\/task-manager-frontend/{n;s/tag:.*/tag: ${IMAGE_TAG}/;}" \
                            helm/task-manager/values.yaml


                        echo "Updated values.yaml:"
                        cat helm/task-manager/values.yaml


                        echo "Configuring Git..."

                        git config user.name "Jenkins"
                        git config user.email "jenkins@local"


                        echo "Committing changes..."

                        git add helm/task-manager/values.yaml

                        git commit \
                            -m "ci: update images to ${IMAGE_TAG}" \
                            || echo "No changes to commit."


                        echo "Pushing GitOps changes..."

                        git push origin main

                        echo "GitOps repository updated successfully."
                    '''
                }
            }
        }
    }

    // =============================================================
    // POST ACTIONS
    // =============================================================
    post {

        success {
            echo '''
            ==========================================
            Jenkins CI/CD Pipeline SUCCESS
            ==========================================
            Backend Image : ${BACKEND_IMAGE}:${IMAGE_TAG}
            Frontend Image: ${FRONTEND_IMAGE}:${IMAGE_TAG}

            GHCR images pushed successfully.
            GitOps repository updated successfully.
            ==========================================
            '''
        }

        failure {
            echo '''
            ==========================================
            Jenkins CI/CD Pipeline FAILED
            ==========================================
            Check the failed stage above.
            ==========================================
            '''
        }

        always {
            sh '''
                docker logout ${REGISTRY} || true
            '''

            echo 'Jenkins pipeline execution finished.'
        }
    }
}