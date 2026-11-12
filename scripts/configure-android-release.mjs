import fs from 'node:fs';
import path from 'node:path';

const required = ['ANDROID_KEYSTORE_BASE64', 'ANDROID_KEYSTORE_PASSWORD', 'ANDROID_KEY_ALIAS', 'ANDROID_KEY_PASSWORD'];
for (const name of required) {
  if (!process.env[name]) throw new Error('Missing required GitHub Actions secret: ' + name);
}

const appDir = path.resolve('android/app');
const gradleFile = path.join(appDir, 'build.gradle');
if (!fs.existsSync(gradleFile)) throw new Error('Generated Android app/build.gradle was not found.');

const keyPath = path.join(appDir, 'sayai-release.jks');
fs.writeFileSync(keyPath, Buffer.from(process.env.ANDROID_KEYSTORE_BASE64.replace(/\s/g, ''), 'base64'));
if (fs.statSync(keyPath).size < 1000) throw new Error('Release keystore file is invalid or empty.');

let gradle = fs.readFileSync(gradleFile, 'utf8');
gradle = gradle.replace(/versionCode\s+\d+/, 'versionCode 8');
gradle = gradle.replace(/versionName\s+["'][^"']+["']/, 'versionName "1.0.0"');

const signing = '\n    signingConfigs {\n        release {\n            storeFile file("sayai-release.jks")\n            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")\n            keyAlias System.getenv("ANDROID_KEY_ALIAS")\n            keyPassword System.getenv("ANDROID_KEY_PASSWORD")\n        }\n    }\n';

if (!gradle.includes('signingConfigs {')) {
  if (/buildTypes\s*\{/.test(gradle)) {
    gradle = gradle.replace(/buildTypes\s*\{/, signing + '\n    buildTypes {');
  } else {
    const androidOpen = gradle.indexOf('android {');
    if (androidOpen < 0) throw new Error('Could not locate the Android configuration block.');
    const androidBody = gradle.slice(androidOpen);
    const closeAt = androidBody.lastIndexOf('}');
    if (closeAt < 0) throw new Error('Could not locate the end of the Android configuration block.');
    const absoluteClose = androidOpen + closeAt;
    gradle = gradle.slice(0, absoluteClose) + signing + '\n    buildTypes { release { signingConfig signingConfigs.release } }\n' + gradle.slice(absoluteClose);
  }
}
if (!/release\s*\{[\s\S]*?signingConfig\s+signingConfigs\.release/.test(gradle)) {
  if (/buildTypes\s*\{/.test(gradle)) {
    gradle = gradle.replace(/(buildTypes\s*\{[\s\S]*?release\s*\{)/, '$1\n            signingConfig signingConfigs.release');
  }
}
fs.writeFileSync(gradleFile, gradle);
console.log('Configured SAY AI release signing and version 1.0.0.');
