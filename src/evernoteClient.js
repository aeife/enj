import {Evernote} from 'evernote';
import config from './config.js';
import moment from 'moment';
import templates from './templates';
import winston from 'winston';
import { handleError } from './errorHandler';

const applicationName = 'simpleEdit';
let client;
let noteStore;
let dailyNote;

export default {
  init,
  addText,
  getNotebooks
};

function init (cb) {
  const authToken = config.get().developerKey;

  client = new Evernote.Client({token: authToken, sandbox: !!config.get().sandbox});
  noteStore = client.getNoteStore();

  getDailyNote(note => {
    dailyNote = note;
    winston.debug('initialized and ready to write daily note');
    cb();
  });
}

function getDailyNote (cb) {
  const filter = new Evernote.NoteFilter({words: 'applicationData:simpleEdit created:day'});
  const spec = new Evernote.NotesMetadataResultSpec({includeCreated: true, includeUpdated: true, includeAttributes: true});

  client.getNoteStore().findNotesMetadata(filter, 0, 1, spec, function (err, result) {
      handleError(err, 'searching daily note');
      if (!result.notes.length) {
        winston.debug('no daily note available yet');
        createDailyNote(({guid}) => {
          getNote(guid, cb)
        });
      } else {
        winston.debug('daily note already exists');
        getNote(result.notes[0].guid, cb)
      }
  });
}

function getNote (guid, cb) {
  winston.debug('fetching daily note');
  noteStore.getNote(guid, true, true, true, true, function (err, note) {
    handleError(err, 'searching fetching note');
    cb(note);
  });
}

function createDailyNote (cb) {
  winston.debug('creating daily note');
  let note = new Evernote.Note();
  note.notebookGuid = config.get().notebook;
  note.title = moment().format('MMMM Do YYYY');

  note.content = `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
    <en-note></en-note>
  `;

  noteStore.createNote(note, function(err, createdNote) {
    handleError(err, 'creating daily note');
    setApplicationDataForNote(createdNote.guid, cb)
  });
}

function setApplicationDataForNote (guid, cb) {
  winston.debug('setting applicationData on daily note');
  noteStore.setNoteApplicationDataEntry(guid, applicationName, applicationName, function (err, result) {
    handleError(err, 'setting applicationData for note');
    cb({guid});
  });
}

function addText (text) {
  let time = moment().format('h:mm a');
  text = text.replace(/\n/g, '<br/>');
  let tmpl;
  if (dailyNote.content.indexOf(templates.timeStamp(time)) > -1) {
    tmpl = templates.entry(text);
  } else {
    tmpl = templates.separator() + templates.timeStamp(time) + templates.entry(text);
  }

  dailyNote.content = dailyNote.content.replace('</en-note>', tmpl + '</en-note>');
  noteStore.updateNote(dailyNote, function (err, result) {
    handleError(err, 'adding text to daily note');
    winston.debug('daily note successfully updated');
  });
}

function getNotebooks (cb) {
  noteStore.listNotebooks(function(err, notebooks){
    handleError(err, 'fetching notebooks');
    winston.debug('list of notebooks loaded');
    cb(notebooks);
  });
}
