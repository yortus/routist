Object.defineProperty(exports, "__esModule", { value: true });
function staticFile(filePath) {
    return (_req, res) => {
        res.sendFile(filePath);
    };
}
exports.default = staticFile;
//# sourceMappingURL=static-file.js.map