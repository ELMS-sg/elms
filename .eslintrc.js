module.exports = {
    extends: ['next/core-web-vitals'],
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'react/no-unescaped-entities': 'off',
        '@next/next/no-img-element': 'warn',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-empty-object-type': 'off'
    },
    // Add this to ensure the rules are applied to all files
    ignorePatterns: ['!**/*'],
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                '@typescript-eslint/no-unused-vars': 'off'
            }
        }
    ]
} 