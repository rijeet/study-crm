const config = {
	testEnvironment: "jsdom",
	transform: {
		"^.+\\.(t|j)sx?$": ["ts-jest", { tsconfig: true }],
	},
	setupFilesAfterEnv: ["@testing-library/jest-dom"],
};

export default config;


