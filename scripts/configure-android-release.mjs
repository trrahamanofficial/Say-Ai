import fs from 'node:fs';
import path from 'node:path';

const required = ['ANDROID_KEYSTORE_BASE64', 'ANDROID_KEYSTORE_PASSWORD', 'ANDROID_KEY_ALIAS', 'ANDROID_KEY_PASSWORD'];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing required GitHub Actions secret: ${name}`);
}

const appDir = path.resolve('android/app');
const gradleFile = path.join(appDir, 'build.gradle');
if (!fs.existsSync(gradleFile)) throw new Error('Generated Android app/build.gradle was not found.');

const keyPath = path.join(appDir, 'sayai-release.jks');
fs.writeFileSync(keyPath, Buffer.from(process.env.ANDROID_KEYSTORE_BASE64.replace(/\\s/g, ''), 'base64'));
if (fs.statSync(keyPath).size < 1000) throw new Error('Release keystore file is invalid or empty.');

let gradle = fs.readFileSync(gradleFile, 'utf8');
gradle = gradle.replace(/versionCode\\s+\\d+/, 'versionCode 2');
gradle = gradle.replace(/versionName\\s+["'][^"']+["']/, 'versionName "1.0.1"');

if (!gradle.includes('signingConfigs {')) {
  const signing = `
    signingConfigs {
        release {
            storeFile file("sayai-release.jks")
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD")
        }
    }
`;
  if (!/buildTypes\\s*\\{\\s*release\\s*\\{/.test(gradle)) {
    throw new Error('Could not locate the Android release buildTypes block.');
  }
  gradle = gradle.replace(/buildTypes\\s*\\{/, signing + '\\n    buildTypes {');
}
if (!/release\\s*\\{[\\s\\S]*?signingConfig\\s+signingConfigs\\.release/.test(gradle)) {
  gradle = gradle.replace(/(buildTypes\\s*\\{\\s*release\\s*\\{)/, '$1\\n            signingConfig signingConfigs.release');
}
fs.writeFileSync(gradleFile, gradle);
console.log('Configured SAY AI release signing and version 1.0.1.');
