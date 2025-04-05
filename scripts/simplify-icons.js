#!/usr/bin/env node
'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, '../public/data/icons');
const outputFile = path.join(__dirname, '../public/data/iconMetaData.ts');

// 读取所有图标文件并生成简化后的数据结构
fs.readdir(iconsDir, (err, files) => {
  if (err) throw err;
  
  const iconData = {};
  
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const iconName = file.replace('.json', '');
      const filePath = path.join(iconsDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      iconData[iconName] = data.categories || [];
    }
  });
  
  // 生成 TypeScript 文件内容
  const fileContent = `export default ${JSON.stringify(iconData, null, 2)};\n`;
  
  // 写入输出文件
  fs.writeFileSync(outputFile, fileContent);
  
  console.log(`已生成简化后的 iconMetaData.ts 文件，包含 ${files.length} 个图标`);
});