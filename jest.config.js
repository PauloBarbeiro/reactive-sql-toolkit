module.exports = {
    testEnvironment: "jsdom",
    moduleDirectories: ['node_modules','src'],
    setupFilesAfterEnv: ['./internals/testing/test-bundler.js']
};