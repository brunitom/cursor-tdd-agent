module.exports = {
  sampleDiff: {
    nameStatus: `M\tsrc/index.js
A\tsrc/utils.js
D\tREADME.old.md`,
    stat: ` src/index.js | 10 +++++++---
 src/utils.js  | 25 +++++++++++++++++++++++++
 README.old.md |  5 -----
 3 files changed, 32 insertions(+), 8 deletions(-)`,
    nameOnly: `src/index.js
src/utils.js
README.old.md`,
  },

  emptyDiff: {
    nameStatus: '',
    stat: '',
    nameOnly: '',
  },

  errorResponse: new Error('Git command failed'),

  complexDiff: {
    nameStatus: `M\tsrc/components/Button.tsx
A\ttest/Button.test.js
M\tpackage.json
A\tmigrations/001_add_users.sql
M\topenapi/api.yaml
A\ttest-specs/login.feature`,
    stat: ` src/components/Button.tsx     | 15 ++++++++++-----
 test/Button.test.js          | 30 ++++++++++++++++++++++++++++++
 package.json                 |  2 +-
 migrations/001_add_users.sql | 12 ++++++++++++
 openapi/api.yaml            |  8 ++++++++
 test-specs/login.feature    | 10 ++++++++++
 6 files changed, 71 insertions(+), 6 deletions(-)`,
    nameOnly: `src/components/Button.tsx
test/Button.test.js
package.json
migrations/001_add_users.sql
openapi/api.yaml
test-specs/login.feature`,
  },
};
