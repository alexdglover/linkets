### Dependencies

- NodeJS
  - Install `node` via nodejs.org or `nvm`
- ZCLI
  - Install Zendesk CLI: `npm install @zendesk/zcli -g`

### Setup

- Set up your credentials to Zendesk: `zcli login -i`

### Run

- Start the server: `zcli apps:server`
- Open zendesk sandbox and add `?zcli_apps=true` to the end of your Zendesk URL

### Deploying to Sandbox

- Increment the build version: `zcli apps:bump [option]`
  - Options:
    - -M, --major Increments the major version by 1
    - -m, --minor Increments the minor version by 1
    - -p, --patch Increments the patch version by 1
- Clean the app: `zcli apps:clean`
- Validate the app: `zcli apps:validate`
- Push the update: `zcli apps:update`

### Deploying to Production

- (If you haven't incremented yet) Increment the build version: `zcli apps:bump [option]`
  - Options:
    - -M, --major Increments the major version by 1
    - -m, --minor Increments the minor version by 1
    - -p, --patch Increments the patch version by 1
- Clean the app: `zcli apps:clean`
- Validate the app: `zcli apps:validate`
- Package the update: `zcli apps:package`
- Navigate to the [Zendesk Apps Management Page](https://vouchinc.zendesk.com/agent/admin/apps/manage)
- Find the 'Linkets' app, click settings and update.
- Choose the file and upload.
