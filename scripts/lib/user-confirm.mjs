import readline from 'readline';

/** 终端人工确认（海外平台 login/publish 门禁） */
export function waitForUserConfirm(message) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`${message}\n`, () => {
      rl.close();
      resolve();
    });
  });
}
