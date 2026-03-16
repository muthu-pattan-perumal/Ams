import { match } from 'path-to-regexp';

const pattern = '/{*path}';
const check = match(pattern);

const testPaths = ['/', '/login', '/dashboard/analytics', '/api/users/123'];

console.log(`Testing pattern: "${pattern}"`);
testPaths.forEach(path => {
    const result = check(path);
    if (result) {
        console.log(`  ✅ MATCH: "${path}" ->`, result.params);
    } else {
        console.log(`  ❌ NO MATCH: "${path}"`);
    }
});
