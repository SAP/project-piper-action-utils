"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.directoryToOutput = void 0;
var fs = __importStar(require("fs"));
var core = __importStar(require("@actions/core"));
var forbiddenChars = /[/:@&!.\s]/;
function dirNameToPrefix(dirName, prefix) {
    var dirSlug = dirName.replace(forbiddenChars, '_').toUpperCase();
    if (prefix) {
        return prefix + "_" + dirSlug;
    }
    return dirSlug;
}
function directoryToOutput(path, prefix) {
    if (!fs.statSync(path).isDirectory()) {
        throw new Error("'" + path + "' is not a directory");
    }
    var oldDir = process.cwd();
    process.chdir(path);
    try {
        var files = fs.readdirSync('.');
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var dirEnt = files_1[_i];
            var stats = fs.statSync(dirEnt);
            if (stats.isDirectory()) {
                directoryToOutput(dirEnt, dirNameToPrefix(process.cwd(), prefix));
            }
            // only files that are under 16 KB are stored as github outputs
            if (stats.size > 16384) {
                core.info("'" + dirEnt + "' is bigger than 16KB not registering as output");
            }
            var outputName = dirEnt.replace(forbiddenChars, '_').toLocaleUpperCase();
            if (prefix) {
                outputName = prefix + "_" + outputName;
            }
            core.setOutput(outputName, fs.readFileSync(dirEnt).toString());
        }
    }
    finally {
        process.chdir(oldDir);
    }
}
exports.directoryToOutput = directoryToOutput;
//# sourceMappingURL=directory-output.js.map