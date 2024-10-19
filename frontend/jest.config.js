module.exports = {
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest", // Asegúrate de usar babel-jest para transformar tu código
  },
  transformIgnorePatterns: [
    "/node_modules/(?!axios)/", // Excluye axios de ser ignorado por la transformación
  ],
  moduleFileExtensions: ["js", "jsx", "json", "node"], // Soporta múltiples tipos de archivo
  moduleNameMapper: {
    "^axios$": require.resolve("axios"), // Resuelve correctamente el módulo de axios
  },
};
