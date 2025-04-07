import fs from 'fs';

const filePath = 'src/module.ts';
const fileContent = fs.readFileSync(filePath, 'utf8');
const cleanedContent = fileContent.replace(/[^\x20-\x7E]/g, '');
fs.writeFileSync(filePath, cleanedContent, 'utf8');
