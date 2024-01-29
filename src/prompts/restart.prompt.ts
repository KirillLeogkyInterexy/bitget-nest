import inquirer from 'inquirer';

export const askToRestart = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'restart',
      message: 'Do you want to restart the application?',
      default: false,
    },
  ]);

  if (answers.restart) {
    console.log('Restarting the application...');

    return true;
  } else {
    console.log('Exiting...');
    process.exit(0);
  }
};
