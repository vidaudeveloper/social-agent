import readline from 'readline';

/** 等待用户在终端确认（不操作浏览器内表单） */
export function waitForUserConfirm(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`${prompt}\n> `, () => {
      rl.close();
      resolve();
    });
  });
}
