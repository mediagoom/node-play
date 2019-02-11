import os, re

def version_file():
    file = os.path.dirname(os.path.realpath(__file__))
    file = os.path.join(file, 'package.json')
    return file

def write_file(path, cnt):
    with open(path, 'w') as f:
        f.write(cnt)
            

def get_file_content(path):
    ctx = ''
    with open(path, 'r') as f:
            for line in f:
                    ctx += line
    return ctx


v=version_file()
appv=os.environ.get('APPVEYOR_REPO_TAG')

appbuild=os.getenv('APPVEYOR_BUILD_VERSION', 'nn.nn.nn')
appm=os.getenv('APPVEYOR_REPO_COMMIT_MESSAGE', '===')
appb=os.getenv('APPVEYOR_REPO_BRANCH', '---')
apptag=os.getenv('APPVEYOR_REPO_TAG_NAME', 'no tag')


travistag=os.environ.get('TRAVIS_TAG')

trbn=os.getenv('TRAVIS_BUILD_NUMBER', 'xx')
trc='TRAVIS'
trb=os.environ.get('TRAVIS_BRANCH')

travis=False
appveyor=False

print 'trb'
print trb
print trbn
print travistag
print '--'

if trb != None:
    travis=True

if appv != None:
    appveyor=True


lversion=os.environ.get('VERSION')

print 'version'
print lversion

if None == lversion:
    lversion='0.0.x'
if appveyor:
    if None != appv:
        lversion=appv
    else:
        lversion=appbuild
if travis:
    if (None != travistag) and ('' != travistag):
        lversion=travistag
    else:
        lversion='0.0.' + trbn


cnt = get_file_content(v)

print 'version.f'
print lversion

cnt = re.sub(r'"version": "\d+\.\d+\.\d+"', "\"version\": \"" + lversion + "\"", cnt)

print cnt

write_file(v, cnt)
