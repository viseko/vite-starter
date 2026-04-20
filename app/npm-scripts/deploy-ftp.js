import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

import deployConfig from '../configs/deploy.js';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем переменные окружения из .env
config();

const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

// Функция для получения аргумента из CLI
function getArgument(arr) {
  const argument = arr.filter(str => /^--/.test(str))[0];
  return argument ? argument.replace('--', '') : null;
}

// Получаем аргумент из командной строки
const argument = getArgument(process.argv);
const deployType = argument || 'default';

// Получаем конфигурацию для выбранного типа дaеплоя
const deploySettings = deployConfig[deployType];

// Проверяем, существует ли такой параметр в конфиге
if (!deploySettings) {
  console.error(`❌ Параметра "${deployType}" нет в настройках app/configs/deploy.js!`);
  console.log(`\nДоступные параметры: ${Object.keys(deployConfig).join(', ')}`);
  process.exit(1);
}

// Проверяем наличие необходимых переменных окружения
if (!process.env.FTP_HOST || !process.env.FTP_USER || !process.env.FTP_PASSWORD || !process.env.FTP_PATH) {
  console.error('❌ Ошибка: не все переменные окружения заданы в .env файле');
  console.log('Необходимые переменные: FTP_HOST, FTP_USER, FTP_PASSWORD, FTP_PATH');
  process.exit(1);
}

const config_ftp = {
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  host: process.env.FTP_HOST,
  port: 21,
  localRoot: join(__dirname, '../../build'),
  remoteRoot: process.env.FTP_PATH,
  include: deploySettings.include,
  exclude: deploySettings.exclude || [],
  deleteRemote: false,
  forcePasv: true,
  sftp: false,
};

console.log(`\n🚀 Начинаем загрузку (тип: ${deployType})...`);
console.log(`📁 <Локальная папка>: ${config_ftp.localRoot}`);
console.log(`🌐 Удаленная папка: ${config_ftp.remoteRoot}`);

ftpDeploy
  .deploy(config_ftp)
  .then(() => {
    console.log('\n✅ Успешно загружено!');
  })
  .catch(err => {
    console.error('\n❌ Ошибка загрузки: ', err);
    process.exit(1);
  });

// Обработка событий
ftpDeploy.on('uploading', data => {
  const percent = Math.round((data.transferredFileCount / data.totalFilesCount) * 100);
  console.log(`[${percent}%] ${data.filename}`);
});

// ftpDeploy.on('uploaded', data => {
//   console.log(`✓ ${data.filename}`);
// });

// ftpDeploy.on('log', data => {
//   console.log(`ℹ️  ${data}`);
// });
