"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpDownloadBuilder = exports.ArchiveType = void 0;
var tc = __importStar(require("@actions/tool-cache"));
var fs = __importStar(require("fs"));
var core = __importStar(require("@actions/core"));
var pathUtils = __importStar(require("path"));
var https_1 = __importDefault(require("https"));
var axios_1 = __importDefault(require("axios"));
var ArchiveType;
(function (ArchiveType) {
    ArchiveType[ArchiveType["ZIP7"] = 0] = "ZIP7";
    ArchiveType[ArchiveType["TAR"] = 1] = "TAR";
    ArchiveType[ArchiveType["ZIP"] = 2] = "ZIP";
    ArchiveType[ArchiveType["XAR"] = 3] = "XAR";
})(ArchiveType = exports.ArchiveType || (exports.ArchiveType = {}));
var HttpDownloadBuilder = /** @class */ (function () {
    /**
     * Constructor
     * @param name the name of the tool which should be download
     * @param version the version of the tool which should be downloaded
     * @param url the url which should be used to download the tools
     */
    function HttpDownloadBuilder(name, version, url) {
        this._addToPath = true;
        this._additionalHeaders = {};
        this._url = url;
        this._name = name;
        this._version = version;
        this._fileMode = fs.constants.S_IRUSR | fs.constants.S_IXUSR;
        this._archiveType = ArchiveType.ZIP;
    }
    /**
     * Tells HttpBuilder that Basic Auth should be used
     * @param username
     * @param password
     */
    HttpDownloadBuilder.prototype.auth = function (username, password) {
        if (!username || !password) {
            this._auth = undefined;
            return this;
        }
        var encoded = Buffer.from(username + ":" + password).toString('base64');
        this._auth = "Basic " + encoded;
        return this;
    };
    /**
     * Defines whether we should add the directory of the tool which we just downloaded added to the PATH variable, so
     * that it can later be used by other steps in this job
     * @param addToPath default is true
     */
    HttpDownloadBuilder.prototype.addToPath = function (addToPath) {
        if (addToPath === void 0) { addToPath = true; }
        this._addToPath = addToPath;
        return this;
    };
    /**
     *  Tells http builder that the downloaded file needs to be extracted
     * @param fileToExtract the name of the file inside the archive
     * @param archiveType the archive encoding which is being used
     */
    HttpDownloadBuilder.prototype.extract = function (fileToExtract, archiveType) {
        if (archiveType === void 0) { archiveType = ArchiveType.ZIP; }
        this._fileToExtract = fileToExtract;
        this._archiveType = archiveType;
        return this;
    };
    HttpDownloadBuilder.prototype.chmod = function (mode) {
        this._fileMode = mode;
        return this;
    };
    /**
     * Executes the download
     */
    HttpDownloadBuilder.prototype.download = function (headers) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.downloadUsingCache(headers)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    HttpDownloadBuilder.prototype.downloadUsingCache = function (headers) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheEntry, p, path, extract, retPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._name || !this._version) {
                            throw new Error('name should not be empty when downloading with cache');
                        }
                        cacheEntry = tc.find(this._name, this._version, 'x64');
                        if (cacheEntry) {
                            p = pathUtils.join(cacheEntry, this._name);
                            fs.chmodSync(p, this._fileMode);
                            this.modifyPath(cacheEntry);
                            return [2 /*return*/, cacheEntry];
                        }
                        return [4 /*yield*/, this.downloadTool(this._url, headers)];
                    case 1:
                        path = _a.sent();
                        if (!this._fileToExtract) return [3 /*break*/, 3];
                        extract = this.getExtractMethod();
                        return [4 /*yield*/, extract(this._fileToExtract)];
                    case 2:
                        path = _a.sent();
                        _a.label = 3;
                    case 3:
                        fs.chmodSync(path, this._fileMode);
                        return [4 /*yield*/, tc.cacheFile(path, this._name, this._name, this._version)];
                    case 4:
                        retPath = _a.sent();
                        this.modifyPath(retPath);
                        fs.unlinkSync(path);
                        return [2 /*return*/, retPath];
                }
            });
        });
    };
    HttpDownloadBuilder.prototype.modifyPath = function (retPath) {
        if (this._addToPath) {
            core.addPath(retPath);
        }
    };
    HttpDownloadBuilder.prototype.downloadTool = function (url, headers) {
        return __awaiter(this, void 0, void 0, function () {
            var client, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = this.getHttpClient(headers);
                        return [4 /*yield*/, client.get(url, { responseType: 'stream' })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.streamToDisk(response.data)];
                }
            });
        });
    };
    HttpDownloadBuilder.prototype.getHttpClient = function (headers) {
        if (headers === void 0) { headers = {}; }
        if (this._auth) {
            headers = __assign(__assign({}, headers), { authorization: this._auth });
        }
        headers = __assign(__assign({}, headers), { 'User-Agent': 'sap-piper-action' });
        var agent = new https_1.default.Agent({
            rejectUnauthorized: false
        });
        return axios_1.default.create({
            headers: headers,
            httpsAgent: agent
        });
    };
    HttpDownloadBuilder.prototype.streamToDisk = function (downloadStream) {
        return __awaiter(this, void 0, void 0, function () {
            var tmpPath, writeStream;
            var _this = this;
            return __generator(this, function (_a) {
                tmpPath = process.env.RUNNER_TEMP + "/piper-download-" + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
                writeStream = fs.createWriteStream(tmpPath);
                downloadStream.pipe(writeStream);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var error = false;
                        downloadStream.on('error', function (err) {
                            error = true;
                            writeStream.close();
                            fs.unlinkSync(tmpPath);
                            reject(err);
                        });
                        downloadStream.on('close', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (!error) {
                                    writeStream.close();
                                    resolve(tmpPath);
                                }
                                return [2 /*return*/];
                            });
                        }); });
                    })];
            });
        });
    };
    HttpDownloadBuilder.prototype.getExtractMethod = function () {
        switch (this._archiveType) {
            case ArchiveType.TAR:
                return tc.extractTar;
            case ArchiveType.XAR:
                return tc.extractXar;
            case ArchiveType.ZIP7:
                return tc.extract7z;
            case ArchiveType.ZIP:
                return tc.extractZip;
            default:
                return tc.extractZip;
        }
    };
    return HttpDownloadBuilder;
}());
exports.HttpDownloadBuilder = HttpDownloadBuilder;
//# sourceMappingURL=http-downloader.js.map