const path          = require('path')
const helpers       = require('yeoman-test')
const CrayGenerator = require('lib/cray-generator')
const Shell         = require('lib/shell')
const fs            = require('fs-extra')
const Git           = require('lib/git')
const assert        = require('yeoman-assert')

describe('generator-cray-service:app', () => {

  const destinationRoot = path.resolve(__dirname, '.output')
  let shellExecStub     = null
  let gitCloneStub      = null

  beforeEach(() => {
    shellExecStub = jest.spyOn(Shell.prototype, 'exec').mockImplementation(() => {
      return Promise.resolve({
        code: 0,
        stdout: '',
        stderr: '',
      })
    })
    gitCloneStub = jest.spyOn(Git.prototype, 'clone').mockImplementation(() => {
      return Promise.resolve({
        code: 0,
        stdout: '',
        stderr: '',
      })
    })
  })
  afterEach(() => {
    if (shellExecStub && shellExecStub.mockRestore) {
      shellExecStub.mockRestore()
    }
    if (gitCloneStub && gitCloneStub.mockRestore) {
      gitCloneStub.mockRestore()
    }
    fs.removeSync(destinationRoot)
  })

  const createGenerator = (prompts = {}) => {
    return helpers
      .run(path.resolve(__dirname, '..', 'generators', 'app'))
      .withOptions({
        destinationRoot: destinationRoot,
      })
      .withPrompts(prompts)
  }

  const getDefaultPrompts = () => {
    return {
      repoUrl: 'none',
      repoUsername: 'none',
      repoPassword: 'none',
      hasWebFrontend: false,
      requiresExternalAccess: false,
      servicePort: '8080',
      language: 'python3',
      isDaemon: false,
      isStateful: false,
      requiresEtcdCluster: false,
      requiresSqlCluster: false,
      cliEnabled: false,
      cliName: null,
      cliSpecFile: null,
    }
  }

  it('ensure that an invalid repo URL triggers an error', () => {
    const prompts = getDefaultPrompts()
    const handleErrorStub = jest.spyOn(CrayGenerator.prototype, '_handleError').mockImplementation(() => {})
    return createGenerator(prompts).catch(() => {
      expect(handleErrorStub).toHaveBeenCalled()
      handleErrorStub.mockRestore()
    })
  })

  it('ensure that a common run can complete with basic prompts and expected output', () => {
    const prompts = getDefaultPrompts()
    prompts.repoUrl = 'https://stash.us.cray.com/CLOUD/cray-example-service.git'
    prompts.repoUsername = 'user'
    prompts.repoPassword = 'password'
    return createGenerator(prompts).then(() => {
      expect(gitCloneStub).toHaveBeenCalledWith(prompts.repoUrl, `${destinationRoot}/cray-example-service`, 'feature/cray-service-generator-updates')
      assert.file([
        path.resolve(`${destinationRoot}/cray-example-service`, 'Jenkinsfile'),
        path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'Chart.yaml'),
      ])
    })
  })

  it('ensure kubernetes daemonset works', () => {
    const prompts = getDefaultPrompts()
    prompts.repoUrl = 'https://stash.us.cray.com/CLOUD/cray-example-service.git'
    prompts.repoUsername = 'user'
    prompts.repoPassword = 'password'
    prompts.isDaemon = true
    return createGenerator(prompts).then(() => {
      expect(gitCloneStub).toHaveBeenCalledWith(prompts.repoUrl, `${destinationRoot}/cray-example-service`, 'feature/cray-service-generator-updates')
      assert.file([
        path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'),
      ])
      assert.fileContent([
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'DaemonSet'],
      ])
    })
  })

  it('ensure kubernetes statefulset works', () => {
    const prompts = getDefaultPrompts()
    prompts.repoUrl = 'https://stash.us.cray.com/CLOUD/cray-example-service.git'
    prompts.repoUsername = 'user'
    prompts.repoPassword = 'password'
    prompts.isStateful = true
    return createGenerator(prompts).then(() => {
      expect(gitCloneStub).toHaveBeenCalledWith(prompts.repoUrl, `${destinationRoot}/cray-example-service`, 'feature/cray-service-generator-updates')
      assert.file([
        path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'),
      ])
      assert.fileContent([
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'StatefulSet'],
      ])
    })
  })

  it('ensure values existsCallback() works', () => {
    const prompts = getDefaultPrompts()
    prompts.repoUrl = 'https://stash.us.cray.com/CLOUD/cray-example-service.git'
    prompts.repoUsername = 'user'
    prompts.repoPassword = 'password'
    prompts.requiresExternalAccess = true
    prompts.requiresEtcdCluster = true
    prompts.requiresSqlCluster = true
    gitCloneStub.mockRestore()
    gitCloneStub = jest.spyOn(Git.prototype, 'clone').mockImplementation((_, repoPath) => {
      fs.mkdirSync(`${repoPath}`)
      fs.mkdirSync(`${repoPath}/kubernetes`)
      fs.mkdirSync(`${repoPath}/kubernetes/cray-example-service`)
      fs.writeFileSync(`${repoPath}/kubernetes/cray-example-service/values.yaml`, `
cray-service:
  type: DaemonSet
  nameOverride: cray-example-service

  containers:
    - name: cray-example-service
      image:
        repository: cray/cray-example-service
      ports:
        - name: http
          port: 80
      livenessProbe:
        enabled: true
        port: 80
        path: /
      readinessProbe:
        enabled: true
        port: 80
        path: /
`)
      return Promise.resolve({
        code: 0,
        stdout: '',
        stderr: '',
      })
    })
    return createGenerator(prompts).then(() => {
      expect(gitCloneStub).toHaveBeenCalledWith(prompts.repoUrl, `${destinationRoot}/cray-example-service`, 'feature/cray-service-generator-updates')
      assert.file([
        path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'),
      ])
      assert.fileContent([
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'Deployment'],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'port: 8080'],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'ingress'],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'etcdCluster'],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'sqlCluster'],
      ])
    })
  })

  it('ensure values existsCallback() works for removing ingress, etcdCluster, sqlCluster', () => {
    const prompts = getDefaultPrompts()
    prompts.repoUrl = 'https://stash.us.cray.com/CLOUD/cray-example-service.git'
    prompts.repoUsername = 'user'
    prompts.repoPassword = 'password'
    gitCloneStub.mockRestore()
    gitCloneStub = jest.spyOn(Git.prototype, 'clone').mockImplementation((_, repoPath) => {
      fs.mkdirSync(`${repoPath}`)
      fs.mkdirSync(`${repoPath}/kubernetes`)
      fs.mkdirSync(`${repoPath}/kubernetes/cray-example-service`)
      fs.writeFileSync(`${repoPath}/kubernetes/cray-example-service/values.yaml`, `
cray-service:
  type: DaemonSet
  nameOverride: cray-example-service

  containers:
    - name: cray-example-service
      image:
        repository: cray/cray-example-service
      ports:
        - name: http
          port: 80
      livenessProbe:
        enabled: true
        port: 80
        path: /
      readinessProbe:
        enabled: true
        port: 80
        path: /

  ingress:
    enabled: true
  sqlCluster:
    enabled: true
  etcdCluster:
    enabled: true
`)
      return Promise.resolve({
        code: 0,
        stdout: '',
        stderr: '',
      })
    })
    return createGenerator(prompts).then(() => {
      expect(gitCloneStub).toHaveBeenCalledWith(prompts.repoUrl, `${destinationRoot}/cray-example-service`, 'feature/cray-service-generator-updates')
      assert.file([
        path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'),
      ])
      assert.noFileContent([
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'ingress'],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'etcdCluster'],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'sqlCluster'],
      ])
    })
  })

})
