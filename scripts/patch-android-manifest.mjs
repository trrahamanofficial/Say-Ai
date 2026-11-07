import { readFileSync, writeFileSync } from 'node:fs';

const path = 'android/app/src/main/AndroidManifest.xml';
let xml = readFileSync(path, 'utf8');
if (xml.includes('android:scheme="com.trofficial.sayai"')) {
  console.log('SAY AI OAuth deep link already present.');
  process.exit(0);
}
const activity = /(<activity\b(?=[^>]*android:name="[^"]*MainActivity")[\s\S]*?)(<\/activity>)/;
if (!activity.test(xml)) throw new Error('Could not find MainActivity in AndroidManifest.xml');
const filter = `
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="com.trofficial.sayai" android:host="login-callback" />
            </intent-filter>
`;
xml = xml.replace(activity, (_match, before, close) => before + filter + close);
writeFileSync(path, xml);
console.log('SAY AI Google OAuth deep link registered.');
