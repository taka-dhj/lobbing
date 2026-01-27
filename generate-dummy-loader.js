import { dummyReservations } from './src/data/dummyData.js';
import fs from 'fs';

const data = JSON.stringify(dummyReservations);
const script = `localStorage.setItem('lobbing-reservations', ${JSON.stringify(data)}); location.reload();`;

fs.writeFileSync('load-dummy-data.js', script);
console.log('✅ load-dummy-data.js を生成しました');
console.log('📋 ブラウザのコンソール（F12）で以下を実行してください:');
console.log('');
console.log(script);
console.log('');
