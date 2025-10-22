module.exports = {
    testEnvironment: "node",
    verbose: true,
    reporters: [
        "default",
        [
            "jest-html-reporters",
            {
                publicPath: "./reports",
                filename: "test-report.html",
                expand: true,
                pageTitle: "Inventory Management System Unit Test Report",
            },
        ],
    ],
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.js",
        "!src/**/*.test.js",
    ],
    coverageDirectory: "./coverage",
    coverageReporters: ["text", "lcov", "html"],
};
