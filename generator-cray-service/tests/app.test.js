/*
 * MIT License
 *
 * (C) Copyright [2021] Hewlett Packard Enterprise Development LP
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

const path          = require('path')
const helpers       = require('yeoman-test')
const TestAdapter   = require('yeoman-test/lib/adapter').TestAdapter
const Generator     = require('yeoman-generator')
const CrayGenerator = require('lib/cray-generator')
const Shell         = require('lib/shell')
const fs            = require('fs-extra')
const Git           = require('lib/git')
const assert        = require('yeoman-assert')
const yeomanEnv     = require('yeoman-environment')
const Request       = require('lib/request')

describe('generator-cray-service:app', () => {

  const destinationRoot = path.resolve(__dirname, '.output')
  const defaultOptions  = {
    destinationRoot: destinationRoot,
  }
  let shellExecStub     = null
  let gitCloneStub      = null
  let requestStub       = null

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
    if (requestStub && requestStub.mockRestore) {
      requestStub.mockRestore()
    }
    fs.removeSync(destinationRoot)
  })

  const createGenerator = (prompts = {}, options = {}) => {
    return helpers
      .run(path.resolve(__dirname, '..', 'generators', 'app'))
      .withOptions(options)
      .withPrompts(prompts)
  }

  const getDefaultPrompts = () => {
    return {
      repoUrl: 'none',
      repoUsername: 'none',
      repoPassword: 'none',
      requiresExternalAccess: false,
      hasUi: false,
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

  it('ensure _getChartName() replaces underscores with -', () => {
    const env = yeomanEnv.createEnv([], {}, new TestAdapter())
    env.registerStub(require('../generators/app'), 'gen:test', path.resolve('../generators/app'))
    const generator   = env.create('gen:test', {
      arguments: [],
      options: {},
    })
    expect(generator._getChartName('https://stash.us.cray.com/scm/cloud/cray_example_service.git')).toEqual('cray-example-service')
  })

  it('ensure that a common run can complete with basic prompts and expected output', () => {
    const prompts = getDefaultPrompts()
    prompts.repoUrl = 'https://stash.us.cray.com/CLOUD/cray-example-service.git'
    prompts.repoUsername = 'user'
    prompts.repoPassword = 'password'
    return createGenerator(prompts, defaultOptions).then(() => {
      expect(gitCloneStub).toHaveBeenCalledWith(prompts.repoUrl, `${destinationRoot}/cray-example-service`, 'feature/cray-service-generator-updates')
      assert.file([
        path.resolve(`${destinationRoot}/cray-example-service`, 'Jenkinsfile'),
        path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'Chart.yaml'),
      ])
    })
  })

  it('ensure that a common run with push option set to false works as expected', () => {
    const notifyStub  = jest.spyOn(CrayGenerator.prototype, '_notify').mockImplementation(() => {})
    const prompts     = getDefaultPrompts()
    prompts.repoUrl   = 'https://stash.us.cray.com/CLOUD/cray-example-service.git'
    prompts.repoUsername = 'user'
    prompts.repoPassword = 'password'
    expect.assertions(1)
    return createGenerator(prompts, {
      destinationRoot: destinationRoot,
      push: false,
    }).then(() => {
      expect(notifyStub).toHaveBeenCalledWith('Not committing/pushing changes because the push option was set to off')
      notifyStub.mockRestore()
    })
  })

  it('ensure kubernetes daemonset works', () => {
    const prompts = getDefaultPrompts()
    prompts.repoUrl = 'https://stash.us.cray.com/CLOUD/cray-example-service.git'
    prompts.repoUsername = 'user'
    prompts.repoPassword = 'password'
    prompts.isDaemon = true
    return createGenerator(prompts, defaultOptions).then(() => {
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
    return createGenerator(prompts, defaultOptions).then(() => {
      expect(gitCloneStub).toHaveBeenCalledWith(prompts.repoUrl, `${destinationRoot}/cray-example-service`, 'feature/cray-service-generator-updates')
      assert.file([
        path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'),
      ])
      assert.fileContent([
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'StatefulSet'],
      ])
    })
  })

  it('ensure hasUi = true works', () => {
    const prompts = getDefaultPrompts()
    prompts.repoUrl = 'https://stash.us.cray.com/CLOUD/cray-example-service.git'
    prompts.repoUsername = 'user'
    prompts.repoPassword = 'password'
    prompts.hasUi = true
    return createGenerator(prompts, defaultOptions).then(() => {
      expect(gitCloneStub).toHaveBeenCalledWith(prompts.repoUrl, `${destinationRoot}/cray-example-service`, 'feature/cray-service-generator-updates')
      assert.file([
        path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'),
      ])
      assert.fileContent([
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'ingress:'],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'ui: true'],
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
    return createGenerator(prompts, defaultOptions).then(() => {
      expect(gitCloneStub).toHaveBeenCalledWith(prompts.repoUrl, `${destinationRoot}/cray-example-service`, 'feature/cray-service-generator-updates')
      assert.file([
        path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'),
      ])
      assert.fileContent([
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'Deployment'],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'port: 8080'],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'ingress:'],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'etcdCluster:'],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'sqlCluster:'],
      ])
    })
  })

  it('ensure values existsCallback() works for keeping ingress, etcdCluster, sqlCluster disabled', () => {
    const prompts = getDefaultPrompts()
    prompts.repoUrl = 'https://stash.us.cray.com/CLOUD/cray-example-service.git'
    prompts.repoUsername = 'user'
    prompts.repoPassword = 'password'
    prompts.requiresExternalAccess = false
    prompts.requiresEtcdCluster = false
    prompts.requiresSqlCluster = false
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
    return createGenerator(prompts, defaultOptions).then(() => {
      expect(gitCloneStub).toHaveBeenCalledWith(prompts.repoUrl, `${destinationRoot}/cray-example-service`, 'feature/cray-service-generator-updates')
      assert.file([
        path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'),
      ])
      assert.noFileContent([
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'ingress:'],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'etcdCluster:'],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'sqlCluster:'],
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
    return createGenerator(prompts, defaultOptions).then(() => {
      expect(gitCloneStub).toHaveBeenCalledWith(prompts.repoUrl, `${destinationRoot}/cray-example-service`, 'feature/cray-service-generator-updates')
      assert.file([
        path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'),
      ])
      assert.noFileContent([
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'ingress:'],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'etcdCluster:'],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'sqlCluster:'],
      ])
    })
  })

  it('ensure values existsCallback() works for keeping ingress, etcdCluster, sqlCluster enabled', () => {
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
    return createGenerator(prompts, defaultOptions).then(() => {
      expect(gitCloneStub).toHaveBeenCalledWith(prompts.repoUrl, `${destinationRoot}/cray-example-service`, 'feature/cray-service-generator-updates')
      assert.file([
        path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'),
      ])
      assert.fileContent([
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'ingress:'],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'etcdCluster:'],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'sqlCluster:'],
      ])
    })
  })

  it('ensure values existsCallback() works for setting ui = true on existing ingress resource', () => {
    const prompts = getDefaultPrompts()
    prompts.repoUrl = 'https://stash.us.cray.com/CLOUD/cray-example-service.git'
    prompts.repoUsername = 'user'
    prompts.repoPassword = 'password'
    prompts.hasUi = true
    prompts.requiresExternalAccess = false
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
    return createGenerator(prompts, defaultOptions).then(() => {
      expect(gitCloneStub).toHaveBeenCalledWith(prompts.repoUrl, `${destinationRoot}/cray-example-service`, 'feature/cray-service-generator-updates')
      assert.file([
        path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'),
      ])
      assert.fileContent([
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), 'ui: true'],
      ])
    })
  })

  it('ensure values existsCallback() works for updating a pre cray-service v1.1.0 chart probes and ports', () => {
    const prompts = getDefaultPrompts()
    prompts.repoUrl = 'https://stash.us.cray.com/CLOUD/cray-example-service.git'
    prompts.repoUsername = 'user'
    prompts.repoPassword = 'password'
    prompts.servicePort = '8099'
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
        path: /mypath
        initialDelaySeconds: 20
        periodSeconds: 5
      readinessProbe:
        enabled: true
        port: 80
        path: /mypath
        initialDelaySeconds: 21
        periodSeconds: 6
`)
      return Promise.resolve({
        code: 0,
        stdout: '',
        stderr: '',
      })
    })
    return createGenerator(prompts, defaultOptions).then(() => {
      expect(gitCloneStub).toHaveBeenCalledWith(prompts.repoUrl, `${destinationRoot}/cray-example-service`, 'feature/cray-service-generator-updates')
      assert.file([
        path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'),
      ])
      const expectedLivenessProbeContent = new RegExp('livenessProbe:\\n\\s+initialDelaySeconds: 20\\n\\s+periodSeconds: 5\\n\\s+httpGet:\\n\\s+port: 8099\\n\\s+path: /mypath')
      const expectedReadinessProbeContent = new RegExp('readinessProbe:\\n\\s+initialDelaySeconds: 21\\n\\s+periodSeconds: 6\\n\\s+httpGet:\\n\\s+port: 8099\\n\\s+path: /mypath')
      const expectedPortsContent = new RegExp('ports:\\n\\s+.*name: http\\n\\s+containerPort: 8099\\n\\s+protocol: TCP')
      assert.fileContent([
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), expectedLivenessProbeContent],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), expectedReadinessProbeContent],
        [path.resolve(`${destinationRoot}/cray-example-service`, 'kubernetes', 'cray-example-service', 'values.yaml'), expectedPortsContent],
      ])
    })
  })

  it('ensure _processGitCommitAndPushResult works as expected for branch created', () => {
    const notifyStub  = jest.spyOn(CrayGenerator.prototype, '_notify').mockImplementation(() => {})
    const env         = yeomanEnv.createEnv([], {}, new TestAdapter())
    env.registerStub(require('../generators/app'), 'gen:test', path.resolve('../generators/app'))
    const generator   = env.create('gen:test', {
      arguments: [],
      options: {},
    })
    generator.git = new Git()
    generator._processGitCommitAndPushResult('BRANCH_CREATED', 'http://repo', 'master')
    expect(notifyStub).toHaveBeenCalledWith('Branch master was created in http://repo')
    notifyStub.mockRestore()
  })

  it('ensure _processGitCommitAndPushResult works as expected for pull request opened', () => {
    const notifyStub  = jest.spyOn(CrayGenerator.prototype, '_notify').mockImplementation(() => {})
    const env         = yeomanEnv.createEnv([], {}, new TestAdapter())
    env.registerStub(require('../generators/app'), 'gen:test', path.resolve('../generators/app'))
    const generator   = env.create('gen:test', {
      arguments: [],
      options: {},
    })
    generator.git = new Git()
    generator._processGitCommitAndPushResult('', 'http://repo', 'master')
    expect(notifyStub).toHaveBeenCalledWith('A pull request was opened automatically for master in http://repo')
    notifyStub.mockRestore()
  })

  it('ensure git commit push failure is handled as expected for rejected push', () => {
    const commitAndPushStub  = jest.spyOn(Git.prototype, 'commitAndPush').mockImplementation(() => {
      return Promise.reject('rejected')
    })
    const handleErrorStub = jest.spyOn(CrayGenerator.prototype, '_handleError').mockImplementation(() => {})
    const prompts     = getDefaultPrompts()
    prompts.repoUrl   = 'https://stash.us.cray.com/CLOUD/cray-example-service.git'
    prompts.repoUsername = 'user'
    prompts.repoPassword = 'password'
    expect.assertions(1)
    return createGenerator(prompts, defaultOptions).then(() => {
      expect(handleErrorStub).toHaveBeenCalledWith(expect.stringMatching(/git\sbranch\spush\swas\srejected/g))
      handleErrorStub.mockRestore()
      commitAndPushStub.mockRestore()
    })
  })

  it('ensure git commit push generic failure is handled as expected', () => {
    const commitAndPushStub  = jest.spyOn(Git.prototype, 'commitAndPush').mockImplementation(() => {
      return Promise.reject('FAILURE')
    })
    const handleErrorStub = jest.spyOn(CrayGenerator.prototype, '_handleError').mockImplementation(() => {})
    const prompts     = getDefaultPrompts()
    prompts.repoUrl   = 'https://stash.us.cray.com/CLOUD/cray-example-service.git'
    prompts.repoUsername = 'user'
    prompts.repoPassword = 'password'
    expect.assertions(1)
    return createGenerator(prompts, defaultOptions).then(() => {
      expect(handleErrorStub).toHaveBeenCalledWith('FAILURE')
      handleErrorStub.mockRestore()
      commitAndPushStub.mockRestore()
    })
  })

  it('ensure case of spec swagger file existing works', () => {
    const findFileStub    = jest.spyOn(require('find'), 'fileSync').mockImplementation(() => { return ['/tmp/swagger'] })
    const prompts         = getDefaultPrompts()
    prompts.repoUrl       = 'https://stash.us.cray.com/CLOUD/cray-example-service.git'
    prompts.repoUsername  = 'user'
    prompts.repoPassword  = 'password'
    prompts.existingSwaggerFile = 'mine'
    prompts.runSwaggerCodegen   = false
    const promptSpy             = jest.spyOn(Generator.prototype, 'prompt').mockImplementation(() => { return Promise.resolve(prompts) })
    return createGenerator(prompts, defaultOptions).then(() => {
      expect(promptSpy).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          name: 'existingSwaggerFile'
        })
      ]))
      findFileStub.mockRestore()
      promptSpy.mockRestore()
    })
  })

  it('ensure case of swagger_server directory already existing works', () => {
    const existsSyncStub = jest.spyOn(require('fs-extra'), 'existsSync').mockImplementation((filePath) => {
      if (filePath.match(/swagger_server/g)) {
        return true
      }
      return require('fs').existsSync(filePath)
    })
    const prompts         = getDefaultPrompts()
    prompts.repoUrl       = 'https://stash.us.cray.com/CLOUD/cray-example-service.git'
    prompts.repoUsername  = 'user'
    prompts.repoPassword  = 'password'
    prompts.existingSwaggerFile = 'mine'
    prompts.runSwaggerCodegen   = false
    const promptSpy             = jest.spyOn(Generator.prototype, 'prompt').mockImplementation(() => { return Promise.resolve(prompts) })
    return createGenerator(prompts, defaultOptions).then(() => {
      expect(promptSpy).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          name: 'runSwaggerCodegen'
        })
      ]))
      existsSyncStub.mockRestore()
      promptSpy.mockRestore()
    })
  })

  it('ensure instruction to replace existing swagger file works as expected', () => {
    const findFileStub    = jest.spyOn(require('find'), 'fileSync').mockImplementation(() => { return ['FOUND_SWAGGER_FILE'] })
    const existsSyncStub  = jest.spyOn(require('fs'), 'existsSync').mockImplementation((filePath) => {
      if (filePath.match(/FOUND_SWAGGER_FILE/g)) return true
      return require('fs-extra').existsSync(filePath)
    })
    const unlinkSyncStub  = jest.spyOn(require('fs'), 'unlinkSync').mockImplementation(() => {})
    const prompts         = getDefaultPrompts()
    prompts.repoUrl       = 'https://stash.us.cray.com/CLOUD/cray-example-service.git'
    prompts.repoUsername  = 'user'
    prompts.repoPassword  = 'password'
    prompts.existingSwaggerFile = 'replace'
    prompts.runSwaggerCodegen   = false
    return createGenerator(prompts, defaultOptions).then(() => {
      expect(unlinkSyncStub).toHaveBeenCalledWith(expect.stringMatching(/FOUND_SWAGGER_FILE/g))
      existsSyncStub.mockRestore()
      findFileStub.mockRestore()
      unlinkSyncStub.mockRestore()
    })
  })

  it('ensure _cloneForkedRepo() works in the cli section for a fork that doesn\'t yet exist', () => {
    let count         = 0
    const cloneStub   = jest.spyOn(Git.prototype, 'clone').mockImplementation(() => {
      if (count == 0) {
        count++
        return Promise.reject('does not exist')
      }
      return Promise.resolve('clone succeeded')
    })
    const forkStub    = jest.spyOn(Git.prototype, 'fork').mockImplementation(() => {
      return Promise.resolve('fork succeeded')
    })
    const env         = yeomanEnv.createEnv([], {}, new TestAdapter())
    env.registerStub(require('../generators/app'), 'gen:test', path.resolve('../generators/app'))
    const generator   = env.create('gen:test', {
      arguments: [],
      options: {},
    })
    generator.git = new Git()
    generator.initializing()
    expect.assertions(1)
    return generator.sections.cli._cloneForkedRepo().then(() => {
      expect(forkStub).toHaveBeenCalled()
      forkStub.mockRestore()
      cloneStub.mockRestore()
    })
  })

  it('ensure that _getCurrentChartVersion() finds the right version', () => {
    const env         = yeomanEnv.createEnv([], {}, new TestAdapter())
    env.registerStub(require('../generators/app'), 'gen:test', path.resolve('../generators/app'))
    const generator   = env.create('gen:test', {
      arguments: [],
      options: {},
    })
    generator.git     = new Git()
    generator.request = new Request()
    requestStub = jest.spyOn(generator.request, 'request').mockImplementation((_, callback) => {
      return new Promise((resolve, reject) => {
        const error = null
        const response = {
          statusCode: 200
        }
        const body = [{'name':'cray-service','version':'1.3.1'},{'name':'cray-service','version':'1.0.0'}]
        const result = callback(error, response, body)
        if (result === true) {
          return resolve({response, body})
        }
        return reject(result)
      })
    })
    expect.assertions(2)
    generator._getCurrentChartVersion('cray-service').then((version) => {
      expect(requestStub).toHaveBeenCalled()
      expect(version).toEqual('1.3.1')
    }).catch((error) => {
      throw error
    })
  })

})
