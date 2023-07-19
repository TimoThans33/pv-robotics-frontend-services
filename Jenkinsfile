def AUTHOR_ID = 'primevision'
def VERSION_MAJOR = 0
def VERSION_MINOR = 1
def VERSION_PATCH = 1
def VERSION_TWEAK = ''
def PROJECT_NAME = 'qb'
def IS_BRANCH_HEAD = false
def IS_RELEASE = false
def IS_ALPHA = false
def IS_BETA = false
def VERSION_METADATA = ''
def REVISION = 0

def CREATED_ARTIFACTS = []

def COMMON_PATH_AMD = 'primevision/pv-common/master/amd64x/pv-common_1.5.0-rc-23-82e6a8a_amd64.deb'
def TJESS_PATH_AMD = 'tjess/tjess-transport/release/2.1.1/amd64x/tjess-transport_2.1.1_amd64.deb'
def MS_PATH_AMD = 'primevision/pv-msgs/release/3.0.0/amd64x/pv-msgs_3.0.0_amd64.deb'
def DSC_PATH_AMD = 'primevision/device-storage-client/release/1.1.1/amd64x/device-storage-client_1.1.1_amd64.deb'

pipeline {
    agent {
        kubernetes {
            yaml '''
kind: Pod
metadata:
  name: qb
spec:
  containers:
  - name: amd
    image: cicdpvacr01.azurecr.io/pv-as-agent-x86:containerd
    imagePullPolicy: Always
    command:
      - cat
    tty: true
'''
        }
    }
    stages {
        stage('Build info') {
            steps {
                script {
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: 'refs/heads/' + env.BRANCH_NAME]],
                        extensions: [[$class: 'CloneOption', noTags: false, shallow: false, depth: 0, reference: '']],
                        userRemoteConfigs: scm.userRemoteConfigs,
                    ])
                    GIT_NAME = sh(returnStdout: true, script: "git --no-pager show -s --format='%an'").trim()
                    echo "${GIT_NAME}"
                    GIT_EMAIL = sh(returnStdout: true, script: "git --no-pager show -s --format='%ae'").trim()
                    echo "${GIT_EMAIL}"
                    BUILD_DATE_SHORT = VersionNumber([ versionNumberString :'${BUILD_DATE_FORMATTED, "yyMMdd"}' ])

                    echo "${BUILD_DATE_SHORT}"
                    echo "${env.BRANCH_NAME}" // if a tag than this will hold the tag. i.e. "1.1.2" we do not use prefix letters!
                    def git_description = sh(returnStdout: true, script: 'git --no-pager describe --tags --long --always').trim()

                    def build_metadata = git_description.split('-')
                    echo "${build_metadata}"
                    echo "${git_description}"

                    if (build_metadata.size() == 4) {
                        (VERSION_MAJOR, VERSION_MINOR, VERSION_PATCH) = build_metadata[0].split("\\.")
                        VERSION_METADATA = build_metadata[1]
                        REVISION = build_metadata[2]
                        VERSION_HASH = build_metadata[3]
                    }
                    else if (build_metadata.size() == 3) {
                        (VERSION_MAJOR, VERSION_MINOR, VERSION_PATCH) = build_metadata[0].split("\\.")
                        REVISION = build_metadata[1]
                        VERSION_HASH = build_metadata[2]
                    }

                    switch (env.BRANCH_NAME) {
                        case ['master', env.TAG_NAME]:
                            IS_RELEASE = true
                            VERSION_TWEAK = ''
                            BUILD_TARGET = 'release'
                            break
                        case ~/(release)\/(.*)/:
                            IS_RELEASE_CANDIDATE = true
                            VERSION_TWEAK = "-rc.${BUILD_NUMBER}-${GIT_COMMIT[0..6]}"
                            BUILD_TARGET = 'release-candidate'
                            break
                        case 'develop':
                            VERSION_TWEAK = "-dev-${REVISION}-${VERSION_HASH}"
                            BUILD_TARGET = 'develop'
                            break
                        case 'beta':
                            VERSION_TWEAK = "-beta-${REVISION}-${VERSION_HASH}"
                            BUILD_TARGET = 'beta'
                            break
                        case 'alpha':
                            VERSION_TWEAK = "-alpha-${REVISION}-${VERSION_HASH}"
                            BUILD_TARGET = 'alpha'
                            break
                        default:
                            VERSION_TWEAK = "-${VERSION_METADATA}-unstable-${REVISION}-${VERSION_HASH}"
                            BUILD_TARGET = 'unstable'
                            break
                    }
                }
            }
        }
        stage('Format Check') {
            steps {
                script {
                    container('amd')
                    {
                        sh 'find * -iname *.h -o -iname *.cpp -o -iname *.hpp -o -iname *.inl -o -iname *.cxx -o -iname *.cc | xargs clang-format-13 -i --dry-run --Werror'
                    }
                }
            }
        }
        stage('Build AMD64') {
            environment {
                BUILD_LOCATION = 'build-amd64'
                ARCH = 'amd64'
            }
            stages {
                stage('Dependencies') {
                    steps {
                        script {
                            // Create paths for all dependencies
                            azureDownload(storageCredentialId: 'azure_storage_key', downloadType: 'blobstorage', containerName: 'do-artifactory', downloadDirLoc: 'deps',
                                                    includeFilesPattern: "${COMMON_PATH_AMD}")
                            azureDownload(storageCredentialId: 'azure_storage_key', downloadType: 'blobstorage', containerName: 'do-artifactory', downloadDirLoc: 'deps',
                                            includeFilesPattern: "${MS_PATH_AMD}")
                            azureDownload(storageCredentialId: 'azure_storage_key', downloadType: 'blobstorage', containerName: 'do-artifactory', downloadDirLoc: 'deps',
                                            includeFilesPattern: "${TJESS_PATH_AMD}")
                            azureDownload(storageCredentialId: 'azure_storage_key', downloadType: 'blobstorage', containerName: 'do-artifactory', downloadDirLoc: 'deps',
                                            includeFilesPattern: "${DSC_PATH_AMD}")
                        }
                    }
                }
                stage('Compile') {
                    steps {
                        script {
                            container('amd')
                            {
                                sh "sudo dpkg -i ${WORKSPACE}/deps/${COMMON_PATH_AMD}"
                                sh "sudo dpkg -i ${WORKSPACE}/deps/${MS_PATH_AMD}"
                                sh "dpkg -i ${WORKSPACE}/deps/${DSC_PATH_AMD}"
                                sh "sudo dpkg -i ${WORKSPACE}/deps/${TJESS_PATH_AMD}"
                                sh "sudo rm -rf ${BUILD_LOCATION}"
                                sh "mkdir ${BUILD_LOCATION}"
                                sh "cd ${BUILD_LOCATION}; cmake -DCUSTOM_MAJOR_VERSION=${VERSION_MAJOR} -DCUSTOM_MINOR_VERSION=${VERSION_MINOR} -DCUSTOM_PATCH_VERSION=${VERSION_PATCH} -DCUSTOM_VERSION_TWEAK=${VERSION_TWEAK} -DBUILD_BARCODE_SIM=ON .."
                                sh "cd ${BUILD_LOCATION}; make -j8"
                                sh "cd ${BUILD_LOCATION}; cpack"
                            }
                        }
                    }
                }
                stage('Archive') {
                    steps {
                        echo 'Uploading'
                        dir("${BUILD_LOCATION}/") {
                            script {
                                def pvt_frontend = findFiles(glob: "pvt_frontend_*_${ARCH}.deb")

                                if (IS_RELEASE) {
                                    azureUpload(filesPath: "${barcode_sim[0].path}", storageCredentialId: 'azure_storage_key', storageType: 'blobstorage',
                                        containerName: 'do-artifactory', virtualPath: "${AUTHOR_ID}/pvt_frontend/${BUILD_TARGET}/${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}/${ARCH}",cleanUpVirtualPath: false)
                                    CREATED_ARTIFACTS << "${AUTHOR_ID}/pvt_frontend/${BUILD_TARGET}/${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}/${ARCH}/${barcode_sim[0].name}"
                                }
                                else {
                                    azureUpload(filesPath: "${barcode_sim[0]}", storageCredentialId: 'azure_storage_key', storageType: 'blobstorage',
                                        containerName: 'do-artifactory', virtualPath: "${AUTHOR_ID}/pvt-frontend/${BUILD_TARGET}/${ARCH}",cleanUpVirtualPath: false)
                                    CREATED_ARTIFACTS << "${AUTHOR_ID}/pvt-frontend/${BUILD_TARGET}/${ARCH}/${barcode_sim[0].name}"
                                }
                            }
                        }
                    }
                }
            }
            post {
                cleanup {
                    echo 'One way or another, I have finished'
                    container('amd')
                    {
                        script {
                            // clean up because we run as root the files need to be removed
                            sh 'rm -rf deps'
                            sh "rm -rf ${BUILD_LOCATION}"
                        }
                    }
                }
            }
        }
    }
    post {
        failure {
            script {
                def jobName = currentBuild.fullDisplayName
                emailext body: '''Something is wrong with ${env.BUILD_URL}''',
                mimeType: 'text/html',
                subject: "[Jenkins failure] ${jobName}",
                to: "${GIT_EMAIL}",
                from: 'sa-autonomous-sorting@primevision.com',
                attachLog: true,
                compressLog: false,
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            }
        }
        success {
            script {
                def url_prefix = 'https://repo.sorting.support'
                def artifacts = ''
                for (a in CREATED_ARTIFACTS) {
                    artifacts = artifacts + " * ${url_prefix}/${a} \n"
                }
                artifacts = artifacts + ''

                echo "${GIT_EMAIL}"
                // mail to: "${GIT_EMAIL}",
                // subject: "Successfull build: ${PROJECT_NAME}",
                // body: "${PROJECT_NAME} was build correctly ${env.BUILD_URL}.\nBuild artifacts:\n${artifacts}"
            }
        }
    }
}
