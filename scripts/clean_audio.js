import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mapPath = path.join(__dirname, '../src/utils/audioMap.js');
const audioDir = path.join(__dirname, '../public/assets/audio');

if (!fs.existsSync(mapPath)) {
  console.error('audioMap.js not found. Run generate_audio.js first.');
  process.exit(1);
}

if (!fs.existsSync(audioDir)) {
  console.error('Audio directory not found.');
  process.exit(1);
}

try {
  const mapContent = fs.readFileSync(mapPath, 'utf8');
  // Simple regex to extract JSON object
  const match = mapContent.match(/export const audioMap = (\{[\s\S]*\});/);
  
  if (!match) {
    console.error('Could not parse audioMap.js');
    process.exit(1);
  }
  
  const audioMap = JSON.parse(match[1]);
  const validFiles = new Set(Object.values(audioMap).map(p => path.basename(p)));
  
  const files = fs.readdirSync(audioDir);
  let deletedCount = 0;
  
  files.forEach(file => {
    if (file.endsWith('.mp3') && !validFiles.has(file)) {
      fs.unlinkSync(path.join(audioDir, file));
      console.log(`Deleted orphaned file: ${file}`);
      deletedCount++;
    }
  });
  
  console.log(`Cleanup complete. Deleted ${deletedCount} orphaned files.`);
} catch (err) {
  console.error('Error during cleanup:', err);
}
