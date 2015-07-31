import request from 'request';
import fileType from 'file-type';
import URI from'URIjs';
import Promise from 'bluebird';
import pick from 'lodash/object/pick';
import deepGet from 'lodash/object/get';
import strRightBack from 'underscore.string/strRightBack';
import { parse as parseContentDisposition } from 'content-disposition';

const getExtension = fileName => {
    if (fileName && fileName.includes('.')) {
        return strRightBack(fileName, '.');
    } else {
        return undefined;
    }
};

const BINARY_CONTENT_TYPES = [
    'application/octet-stream',
    'application/binary'
];

const ARCHIVE_EXTENSIONS = [
    'zip',
    'tar',
    'rar',
    'gz',
    'bz2',
    '7z',
    'xz'
];

export default class Plunger {

    constructor(location, options = {}) {
        this.rawLocation = location;
        this.location = new URI(location);
        this.options = {
            fileTypeDetection: true,
            abort: 'always'
        };
        Object.assign(this.options, options);
    }

    executeRequest() {
        return new Promise((resolve, reject) => {
            this.req = request
                .get(this.rawLocation)
                .on('error', reject)
                .on('response', response => {
                    this.response = response;
                    this.response.pause();
                    resolve(this);
                });
        });
    }

    extractDataFromResponse() {
        Object.assign(this, pick(this.response, 'statusCode', 'headers'));
        if (this.response.headers['content-disposition']) {
            this.contentDisposition = parseContentDisposition(this.response.headers['content-disposition']);
        }
        return this;
    }

    extractFileTypeFromMagicNumber() {
        if (!this.options.fileTypeDetection) return this;
        return new Promise((resolve, reject) => {
            this.response.once('data', chunk => {
                this.fileType = fileType(chunk);
                this.firstChunk = chunk;
                this.response.pause();
                resolve(this);
            });
            this.response.resume();
            setTimeout(() => reject(new Error('Timeout')), 5000);
        });
    }

    closeConnection(force = false) {
        if (this.options.abort === 'always' || force) {
            this.response.destroy();
        }
        return this;
    }

    inspect() {
        return this.executeRequest()
            .then(() => this.extractDataFromResponse())
            .then(() => this.extractFileTypeFromMagicNumber())
            .then(() => this.closeConnection());
    }

    get fileName() {
        return deepGet(this, 'contentDisposition.parameters.filename') || this.location.filename(true);
    }

    get fileTypeExtension() {
        return deepGet(this, 'fileType.ext');
    }

    get fileExtension() {
        let attachmentExt = getExtension(deepGet(this, 'contentDisposition.parameters.filename'));
        let urlExt = getExtension(this.location.filename(true));
        return attachmentExt || urlExt || this.fileTypeExtension;
    }

    get binary() {
        let contentType = this.headers['content-type'];
        if (contentType && BINARY_CONTENT_TYPES.includes(contentType)) return true;
    }

    get archive() {
        if (ARCHIVE_EXTENSIONS.includes(this.fileTypeExtension)) {
            return this.fileTypeExtension;
        } else {
            return false;
        }
    }

    pipeWithResponse(destination) {
        this.destination = destination;
        this.response.pipe(destination);
        destination.write(this.firstChunk);
        this.response.resume();
        this.firstChunk = undefined;
        return destination;
    }

    toObject() {
        return pick(this, 'statusCode', 'headers', 'fileType', 'contentDisposition', 'fileName', 'fileExtension', 'binary', 'archive');
    }

    // computeOptions(options) {
    //     return Object.assign({}, this.options, options);
    // }

}
