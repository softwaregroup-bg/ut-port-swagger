library identifier: 'jenkinsfile@master', retriever: modernSCM([
    $class: 'GitSCMSource',
    remote: 'https://github.com/softwaregroup-bg/jenkinsfile.git'
])

ut ([
    buildImage: 'softwaregroup/impl-docker',
    image: 'mhart/alpine-node:base-10.16.3'
])
