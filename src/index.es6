import request from 'superagent';
import fileType from 'file-type';
import URI from'URIjs';
import pick from 'lodash/object/pick';
import deepGet from 'lodash/object/get';
import strRightBack from 'underscore.string/strRightBack';
import { parse as parseContentDisposition } from 'content-disposition';

let BINARY_CONTENT_TYPES = [
    'application/octet-stream',
    'application/binary'
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
                .buffer(false)
                .end()
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

    closeConnection() {
        if (this.options.abort === 'always') {
            this.req.abort();
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

    get fileExtension() {
        let attachmentFileName = deepGet(this, 'contentDisposition.parameters.filename');
        let attachmentFileExtension = attachmentFileName ? strRightBack(attachmentFileName, '.') : undefined;
        let uriFileName = this.location.filename(true);
        let uriFileExtension = uriFileName !== '/' ? strRightBack(uriFileName, '.') : undefined;
        let fileTypeExtension = deepGet(this, 'fileType.ext');
        return attachmentFileExtension || uriFileExtension || fileTypeExtension;
    }

    get binary() {
        let contentType = this.headers['content-type'];
        if (contentType && BINARY_CONTENT_TYPES.includes(contentType)) return true;
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
        return pick(this, 'statusCode', 'headers', 'fileType', 'contentDisposition', 'fileName', 'fileExtension', 'binary');
    }

    // computeOptions(options) {
    //     return Object.assign({}, this.options, options);
    // }

}
