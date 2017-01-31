import bodyparser from 'koa-body';
import Koa from 'koa';
import os from 'os';
import path from 'path';
import serveStatic from 'koa-static';
import uploaders from 'koa-upload-mw';
import FilesystemStorage from 'koa-upload-mw/lib/storages/Filesystem';
import tokenFromPostInputFieldRule from 'koa-upload-mw/lib/rules/tokens/fromPostInputField';
import maxFilesizeRule from 'koa-upload-mw/lib/rules/filesize/max';
import minFilesizeRule from 'koa-upload-mw/lib/rules/filesize/min';
import pathIsRule from 'koa-upload-mw/lib/rules/path/is';
import mimetypeInRule from 'koa-upload-mw/lib/rules/mimetype/in';

// For demo
const port = process.env.PORT || 3232;
const host = process.env.HOST || 'http://localhost:3232';

/**
 * Save png in a specific folder
 */
const pngOnly = {
  name: 'png-only',
  conditions: [mimetypeInRule(['image/png'])],
  storage: new FilesystemStorage({
    rootUrl: `${host}/png-only`,
    path: path.resolve(__dirname, '../media/png-only'),
  }),
};

/*
- Apply only for autheticated user posting on /secret
- Respond with an error if:
  - not a jpeg nor a png
  - filesize less than 10000 bites
  - filesize more than 100000000 bites
*/
const restrictedUser = {
  name: 'restricted',
  conditions: [
    tokenFromPostInputFieldRule('token', ({ token }) => token === 'tilap'),
    pathIsRule('/secret'),
  ],
  validators: [
    mimetypeInRule(['image/jpeg', 'image/png']),
    minFilesizeRule(1000),
    maxFilesizeRule(100000000),
  ],
  storage: new FilesystemStorage({
    rootUrl: `${host}/restricted`,
    path: path.resolve(__dirname, '../media/restricted'),
  }),
};

/*
- Apply to jpeg images only
- Add a log in console
*/
const jpgHooked = {
  name: 'jpeg-hooked',
  conditions: [mimetypeInRule(['image/jpeg'])],
  storage: async (file) => { // You can use async here
    const storage = new FilesystemStorage({
      rootUrl: `${host}/jpeg-hooked`,
      path: path.resolve(__dirname, '../media/jpeg-hooked'),
    });
    const data = await storage(file);
    // Do what you want here: save in database, add info to response, log, notify....
    const customInfos = { supercalifragi: 'listicexpialidocious' };
    return Object.assign(customInfos, data);
  },
};

// Start the app
const app = new Koa();

app.use(serveStatic(`${__dirname}/../media`));
app.use(bodyparser({
  formidable: { uploadDir: os.tmpdir(), maxFields: 2, multiples: true },
  formLimit: '10mb',
  json: false,
  multipart: true,
  strict: true,
}));

app.use(uploaders([pngOnly, restrictedUser, jpgHooked]));

app.listen(port);
