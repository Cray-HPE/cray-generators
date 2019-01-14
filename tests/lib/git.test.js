const Git = require('lib/git')

describe('git', () => {

  let git           = null
  let shellExecStub = null
  let requestStub   = null

  beforeEach(() => {
    git = new Git()
    requestStub = jest.mock('request')
    shellExecStub = jest.spyOn(git.shell, 'exec').mockImplementation(() => {
      return Promise.resolve({
        code: 0,
        stdout: 'mock stdout',
        stderr: '',
      })
    })
    return git.configure('username', 'password', 'name', 'email')
  })

  afterEach(() => {
    if (shellExecStub && shellExecStub.mockRestore) {
      shellExecStub.mockRestore()
    }
    if (requestStub && requestStub.mockRestore) {
      requestStub.mockRestore()
    }
  })

  it('ensure that getAuthenticatedUrl() injects a username and password into a url', () => {
    expect(git.getAuthenticatedUrl('https://whatever.com')).toEqual('https://username:password@whatever.com')
  })

  it('ensure clone processes in most basic scenario', () => {
    return git.clone('http://repo', '/tmp/repo').then(() => {
      expect(shellExecStub).toHaveBeenCalledWith('git', ['clone', git.getAuthenticatedUrl('http://repo'), '/tmp/repo'], { mask: ['password'] })
    })
  })

  it('ensure clone will attempt to check out existing branch', () => {
    return git.clone('http://repo', '/tmp/repo', 'existing-branch', false).then(() => {
      expect(shellExecStub).toHaveBeenCalledWith('git', ['checkout', 'existing-branch'], {cwd: '/tmp/repo'})
    })
  })

  it('ensure clone will attempt to check out a new branch', () => {
    return git.clone('http://repo', '/tmp/repo', 'new-branch').then(() => {
      expect(shellExecStub).toHaveBeenCalledWith('git', ['checkout', '-b', 'new-branch'], {cwd: '/tmp/repo'})
    })
  })

  it('ensure getRemoteDefaultBranch operates as expected', () => {
    shellExecStub.mockRestore()
    shellExecStub = jest.spyOn(git.shell, 'exec').mockImplementation((command, args) => {
      if (command === 'git' && args.length >= 3 && args[0] === 'remote' && args[1] === 'show' && args[2] === 'origin') {
        return Promise.resolve({
          code: 0,
          stdout: `* remote origin
  Fetch URL: ssh://repo
  Push  URL: ssh://repo
  HEAD branch: custom-branch
  Remote branches:
    bugfix  tracked
    develop tracked
    master  tracked
  Local branches configured for 'git pull':
    develop merges with remote develop
    master  merges with remote master
  Local refs configured for 'git push':
    develop pushes to develop (up to date)
    master  pushes to master  (up to date)`
        })
      }
    })
    return git.getRemoteDefaultBranch('/tmp/whatever').then((result) => {
      expect(result).toEqual('custom-branch')
      shellExecStub.mockRestore()
    })
  })

  it('ensure diffBranches() is triggered and returns successfully', () => {
    shellExecStub.mockRestore()
    shellExecStub = jest.spyOn(git.shell, 'exec').mockImplementation((command, args) => {
      if (command === 'git' && args.length >= 1 && args[0] === 'diff') {
        return Promise.resolve({
          code: 0,
          stdout: 'a diff'
        })
      }
    })
    return git.diffBranches('/tmp/whatever', 'branch1', 'branch2').then((result) => {
      expect(result).toEqual('a diff')
      shellExecStub.mockRestore()
    })
  })

  it('ensure that the flow of commitAndPush() operates as expected', () => {
    const openPullRequestStub = jest.spyOn(git, 'openPullRequest').mockImplementation((repoUrl, branchName, defaultBranch) => {
      return Promise.resolve({ repoUrl, branchName, defaultBranch })
    })
    return git.commitAndPush('/tmp/repo', 'a commit message', { force: true, openPullRequest: true }).then(() => {
      expect(shellExecStub).toHaveBeenCalledWith('git', ['status', '-s'], { cwd: '/tmp/repo' })
      expect(shellExecStub).toHaveBeenCalledWith('git', ['add', '.'], { cwd: '/tmp/repo' })
      expect(shellExecStub).toHaveBeenCalledWith('git', ['commit', '-m', 'a commit message'], { cwd: '/tmp/repo' })
      expect(shellExecStub).toHaveBeenCalledWith('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: '/tmp/repo' })
      expect(shellExecStub).toHaveBeenCalledWith('git', ['push', '-f', 'origin', 'mock stdout'], { cwd: '/tmp/repo', mask: ['password'] })
      expect(shellExecStub).toHaveBeenCalledWith('git', ['remote', 'get-url', 'origin'], { cwd: '/tmp/repo', silent: true })
      expect(shellExecStub).toHaveBeenCalledWith('git', ['remote', 'show', 'origin'], { cwd: '/tmp/repo', silent: true })
      expect(openPullRequestStub).toHaveBeenCalledWith('mock stdout', 'mock stdout', null)
      openPullRequestStub.mockRestore()
    })
  })

  it('ensure that openPullRequest() fails with invalid repo url', () => {
    expect.assertions(1)
    return git.openPullRequest('invalid-repo-url', 'branch name').catch((error) => {
      expect(error.message).toMatch(/Invalid\srepoUrl/g)
    })
  })

})