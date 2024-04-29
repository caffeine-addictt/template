const readline = require('readline');
const fs = require('fs');
const { execSync } = require('child_process');

function handleError(error) {
  if (error.code !== 'ENOENT' && error.code !== 'EEXIST') {
    console.error(error);
    process.exit(1);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to handle system-specific commands
function executeSystemCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'EEXIST') {
      console.error(error.message);
      // Try to continue execution even if some non-critical issues occur
    } else {
      console.error(error);
      process.exit(1);
    }
  }
}

rl.question('Name? (This will go on the LICENSE)\n=> ', (name) => {
  rl.question('Email?\n=> ', (email) => {
    rl.question('Username? (https://github.com/<username>)\n=> ', (username) => {
      rl.question('Repository? (https://github.com/$username/<repo>)\n=> ', (repository) => {
        rl.question('Project name?\n=> ', (proj_name) => {
          rl.question('Short description?\n=> ', (proj_short_desc) => {
            rl.question('Long description?\n=> ', (proj_long_desc) => {
              rl.question('Documentation URL?\n=> ', (docs_url) => {
                console.log('\n\n===== Log =====');
                console.log('Name:', name);
                console.log('Email:', email);
                console.log('Username:', username);
                console.log('Repository:', repository);
                console.log('Project name:', proj_name);
                console.log('Project short description:', proj_short_desc);
                console.log('Project long description:', proj_long_desc);
                console.log('Docs URL:', docs_url);
                console.log('================');

                rl.question('Confirm? (y/n)\n=> ', (confirm) => {
                  if (confirm.toLowerCase() === 'y') {
                    console.log('\nWriting files...');

                    // Remove prettier stuff
                    try {
                      fs.unlinkSync('package.json');
                      fs.unlinkSync('package-lock.json');
                      fs.rmSync('node_modules', { recursive: true });
                    } catch (error) {
                      handleError(error);
                    }

                    // Writing general stuff
                    const filesToUpdate = [
                      'LICENSE',
                      'CITATION.cff',
                    ];
                    filesToUpdate.forEach((fileName) => {
                      try {
                        let fileContent = fs.readFileSync(`./template/${fileName}`, 'utf8');
                        fileContent = fileContent.replace(/{{REPOSITORY}}/g, `${username}/${repository}`)
                          .replace(/{{PROJECT_NAME}}/g, proj_name)
                          .replace(/{{PROJECT_SHORT_DESCRIPTION}}/g, proj_short_desc)
                          .replace(/{{PROJECT_LONG_DESCRIPTION}}/g, proj_long_desc)
                          .replace(/{{DOCS_URL}}/g, docs_url)
                          .replace(/{{EMAIL}}/g, email)
                          .replace(/{{USERNAME}}/g, username)
                          .replace(/{{NAME}}/g, name);
                        fs.writeFileSync(`./template/${fileName}`, fileContent);
                      } catch (error) {
                        // it's a bit different here, won't touch this for now
                        if (error.code !== 'ENOENT' && error.code !== 'EEXIST') {
                          console.error(error);
                          process.exit(1);
                        } else {
                            console.log(`File ${fileName} not found.`);
                        }
                      }
                    });

                    // Write CODEOWNERS
                    try {
                      fs.appendFileSync('./template/.github/CODEOWNERS', `* @${username}`);
                    } catch (error) {
                      // also different here
                      if (error.code !== 'ENOENT' && error.code !== 'EEXIST') {
                        console.error(error);
                        process.exit(1);
                      } else {
                        fs.renameSync('./template/.github/CODEOWNERS', '.github/CODEOWNERS');
                      }
                    }

                    // Optional keep up-to-date
                    rl.question('Would you like to keep up-to-date with the template? (y/n)\n=> ', (up_to_date) => {
                      if (up_to_date.toLowerCase() === 'y') {
                        console.log('Writing ignore file...');
                        try {
                          fs.appendFileSync('./template/.templatesyncignore', `
.github/ISSUE_TEMPLATE/*
.github/CODEOWNERS
.github/CODESTYLE.md
.github/PULL_REQUEST_TEMPLATE.md
.github/SECURITY.md
CITATION.cff
LICENSE
README.md`);
                          fs.appendFileSync('./template/.github/settings.yml', `
  - name: 'CI: Template Sync'
    color: AEB1C2
    description: Sync with upstream template
`);
                          fs.renameSync('./template/.templatesyncignore', '.templatesyncignore');
                          console.log('You can view more configuration here: https://github.com/AndreasAugustin/actions-template-sync');
                        } catch (error) {
                          handleError(error);
                        }
                      } else {
                        console.log('Removing syncing workflow...');
                        try {
                          fs.unlinkSync('./template/.github/workflows/sync-template.yml');
                        } catch (error) {
                          handleError(error);
                        }
                      }

                      // Move from template
                      try {
                        const filesToMove = fs.readdirSync('./template');
                        filesToMove.forEach((file) => {
                          fs.renameSync(`./template/${file}`, `./${file}`);
                        });
                        fs.rmSync('./template', { recursive: true });
                        fs.rmSync('.github', { recursive: true });
                        fs.renameSync('./template/.github', '.github');
                      } catch (error) {
                        handleError(error);
                      }

                      rl.question('Would you like to keep this setup script? (y/n)\n=> ', (keep_script) => {
                        if (keep_script.toLowerCase() !== 'y') {
                          console.log('Removing setup script...');
                          try {
                            fs.unlinkSync(__filename);
                          } catch (error) {
                            handleError(error);
                          }
                        } else {
                          console.log('Okay.');
                        }
                        console.log('\nDone!\nIf you encounter any issues, please report it here: https://github.com/caffeine-addictt/template/issues/new?assignees=caffeine-addictt&labels=Type%3A+Bug&projects=&template=1-bug-report.md&title=[Bug]+');
                        rl.close();
                      });
                    });
                  } else {
                    console.log('Aborted.');
                    rl.close();
                  }
                });
              });
            });
          });
        });
      });
    });
  });
});